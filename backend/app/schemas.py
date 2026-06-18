from pydantic import BaseModel


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

    
class LoginRequest(BaseModel):
    username: str
    password: str
    
class ResumeResponse(BaseModel):
    id: int
    filename: str

    class Config:
        from_attributes = True
        
        
class ResumeResponse(BaseModel):
    id: int
    filename: str

    class Config:
        from_attributes = True
        
class JobDescriptionRequest(BaseModel):
    resume_id: int
    job_description: str    