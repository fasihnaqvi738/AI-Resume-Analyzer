from fastapi import (
    FastAPI,
    Form,
    Depends,
    UploadFile,
    File,
    HTTPException,
)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import engine, SessionLocal
from app.models import Base, User, Resume, AnalysisResult
from app.schemas import UserCreate, LoginRequest, JobDescriptionRequest
from app.utils import hash_password, verify_password
from app.auth import create_access_token, verify_token
from app.resume_parser import extract_text_from_pdf, extract_text_from_docx
from app.analyzer import extract_keywords
from app.ai_analyzer import analyze_resume_with_ai

import os



Base.metadata.create_all(bind=engine)

app = FastAPI()

security = HTTPBearer()



app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
        
@app.get("/")
def home():
    return {"message": "AI Resume Analyzer API Running"}


@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    
    new_user = User(
        username = user.username,
        email = user.email,
        password = hash_password(user.password),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }
    
    
@app.post("/login")
def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    
    user = db.query(User).filter(
        User.username == credentials.username
    ).first()

    if not user:
        return {
            "message": "Invalid username"
        }

    if not verify_password(
        credentials.password,
        user.password
    ):
        return {
            "message": "Invalid password"
        }

    access_token = create_access_token(
    {
        "sub": user.username
    }
)

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }



security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials
    username = verify_token(token)

    if not username:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    user = db.query(User).filter(
        User.username == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    return user



@app.post("/upload-resume")
def upload_resume(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    os.makedirs("uploads", exist_ok=True)

    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    if file.filename.endswith(".pdf"):
        resume_text = extract_text_from_pdf(file_path)
    elif file.filename.endswith(".docx"):
        resume_text = extract_text_from_docx(file_path)
    else:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files allowed"
        )

    resume = Resume(
        title=title,
        filename=file.filename,
        file_path = file_path,
        resume_text=resume_text,
        user_id=current_user.id
    )

    db.add(resume)
    db.commit()
    db.refresh(resume)

    return {
        "message": "Resume uploaded successfully",
        "resume_id": resume.id,
        "title": resume.title,
        "user_id": current_user.id
    }
    
    

@app.post("/analyze")
def analyze_resume(
    request: JobDescriptionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == request.resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )
    resume_keywords = extract_keywords(
        resume.resume_text
    )
    jd_keywords = extract_keywords(
        request.job_description
    )
    matched = resume_keywords.intersection(
        jd_keywords
    )
    missing = jd_keywords - resume_keywords

    ats_score = round(
        len(matched) / max(len(jd_keywords), 1) * 100,
        2
    )
    return {
        "ats_score": ats_score,
        "matched_skills": sorted(list(matched)),
        "missing_skills": sorted(list(missing))
    }
    
    
    
    
@app.post("/ai-analyze")
def ai_analyze(
    resume_id: int = Form(...),
    job_description: str = Form(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code = 404,
            detail = "Resume not found"
        )

    result = analyze_resume_with_ai(
        resume.resume_text,
        job_description
    )

    analysis = AnalysisResult(
        resume_id = resume.id,
        job_description = job_description,
        ats_score=result.get("ats_score", 0),
        result_json = result
    )

    db.add(analysis)
    db.commit()

    return result


@app.get("/analysis-history")
def get_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analyses = (
        db.query(AnalysisResult)
        .join(Resume)
        .filter(Resume.user_id == current_user.id)
        .order_by(AnalysisResult.created_at.desc())
        .all()
    )
    return [
        {
            "id": analysis.id,
            "ats_score": analysis.ats_score,
            "created_at": analysis.created_at,
            "resume_title": analysis.resume.title
        }
        for analysis in analyses
    ]




@app.get("/analysis/{analysis_id}")
def get_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = (
        db.query(AnalysisResult)
        .join(Resume)
        .filter(
            AnalysisResult.id == analysis_id,
            Resume.user_id == current_user.id
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )

    return analysis



@app.get("/my-resumes")
def get_my_resumes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resumes = db.query(Resume).filter(
        Resume.user_id == current_user.id
    ).all()

    return resumes


app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)



@app.get("/resume/{resume_id}")
def get_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    result = {
        "id": resume.id,
        "title": resume.title,
        "file_url": f"http://127.0.0.1:8000/{resume.file_path}"
    }

    print(result)

    return result


@app.delete("/resume/{resume_id}")
def delete_resume(
    resume_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()

    if not resume:
        raise HTTPException(
            status_code=404,
            detail="Resume not found"
        )

    db.query(AnalysisResult).filter(
        AnalysisResult.resume_id == resume.id
    ).delete()

    if resume.file_path and os.path.exists(resume.file_path):
        os.remove(resume.file_path)

    db.delete(resume)
    db.commit()

    return {
        "message": "Resume deleted successfully"
    }
    
    
   
@app.delete("/analysis/{analysis_id}")
def delete_analysis(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    analysis = (
        db.query(AnalysisResult)
        .join(Resume)
        .filter(
            AnalysisResult.id == analysis_id,
            Resume.user_id == current_user.id
        )
        .first()
    )

    if not analysis:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found"
        )

    db.delete(analysis)
    db.commit()

    return {
        "message": "Analysis deleted successfully"
    }