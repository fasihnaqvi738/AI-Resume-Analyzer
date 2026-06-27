#  AI Resume Analyzer

An AI-powered Resume Analyzer that helps job seekers evaluate their resumes against job descriptions, identify missing skills, improve ATS compatibility, and receive AI-generated suggestions.

Built using **FastAPI**, **React**, **PostgreSQL**, and **Google Gemini AI**.

---

##  Features

### User Management
- User Registration
- User Login
- JWT Authentication
- Secure Protected Routes

###  Resume Management
- Upload Resume (PDF / DOCX)
- View Uploaded Resume
- Delete Resume
- Store Extracted Resume Content

###  AI Resume Analysis
- Compare Resume with Job Description
- Calculate ATS Score
- Identify Matched Skills
- Identify Missing Skills
- Generate AI-Based Suggestions
- Detailed Resume Feedback using Gemini AI

###  Analysis History
- Save Previous Analyses
- View Complete Analysis Results
- Delete Analysis Records

---

##  Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- PostgreSQL
- JWT Authentication
- PyPDF2
- python-docx
- Google Gemini API

### Frontend
- React
- Axios
- React Router DOM

---

##  Project Structure

```text
AI Resume Analyzer
│
├── backend
│   ├── app
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── database.py
│   │   ├── auth.py
│   │   ├── utils.py
│   │   ├── analyzer.py
│   │   ├── ai_analyzer.py
│   │   └── resume_parser.py
│   │
│   └── requirements.txt
│
├── frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── ...
│
└── .gitignore
```

---

#  Installation

## 1. Clone Repository

```bash
git clone https://github.com/yourusername/ai-resume-analyzer.git

cd ai-resume-analyzer
```

---

## 2. Backend Setup

Navigate to backend folder:

```bash
cd backend
```

Create virtual environment:

```bash
python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 3. PostgreSQL Setup

Create a PostgreSQL database.

Example:

```sql
CREATE DATABASE resume_analyzer;
```

Update your database connection string inside:

```text
backend/app/database.py
```

Example:

```python
DATABASE_URL = "postgresql://username:password@localhost/resume_analyzer"
```

---

## 4. Gemini API Setup

### Create Gemini API Key

1. Visit:

https://aistudio.google.com/

2. Sign in with your Google Account.

3. Click:

```text
Get API Key
```

4. Create a new API key.

5. Copy the generated key.

---

### Create Environment File

Inside the backend folder create:

```text
.env
```

Add:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

Example:

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXX
```
 Never commit your `.env` file to GitHub.

---

## 5. Run Backend

Inside backend folder:

```bash
uvicorn app.main:app --reload
```

Backend runs on:

```text
http://127.0.0.1:8000
```

---

## 6. Frontend Setup

Open a new terminal.

Navigate to frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start React app:

```bash
npm start
```

Frontend runs on:

```text
http://localhost:3000
```

---

# 🔐 Environment Variables

Create:

```text
backend/.env
```

Required variables:

```env
GEMINI_API_KEY=your_gemini_api_key
```

---


#  Future Improvements

- Resume Versioning
- Multi-Resume Comparison
- Export Analysis Reports (PDF)
- Advanced ATS Scoring
- Role-Specific Resume Suggestions

---

# Author

**Syed Mohd Fasih Naqvi**

- GitHub: https://github.com/yourusername
- LinkedIn: Add Your LinkedIn Profile

---

## ⭐ If you found this project useful, consider giving it a star.
