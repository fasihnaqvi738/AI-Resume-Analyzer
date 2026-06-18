import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")

def analyze_resume_with_ai(resume_text, job_description):
    prompt = f"""
You are an expert ATS system.

Resume:
{resume_text}

Job Description:
{job_description}

Analyze the resume against the job description.

Return ONLY valid JSON in this format:

{{
    "ats_score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "suggestions": []
}}
"""

    response = model.generate_content(prompt)

    
    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "").replace("```", "").strip()

    return json.loads(text)