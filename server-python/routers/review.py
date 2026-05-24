import logging
import os
import google.generativeai as genai
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json

router = APIRouter()
logger = logging.getLogger(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")
model = None

if API_KEY:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(
        model_name='gemini-3.1-flash-lite-preview'
    )

class ReviewRequest(BaseModel):
    code: str
    language: str

@router.post("/ai/review", tags=["AI Mentor"])
async def review_code(request: ReviewRequest):
    if not model:
        raise HTTPException(status_code=503, detail="AI services are currently unavailable.")
    
    prompt = f"""
You are an expert AI coding mentor. Please review the following {request.language} code.
Provide a concise response containing:
1. A brief overview of the code quality.
2. A list of 1-3 actionable performance or security suggestions.
3. A score from 1-10 on the code quality.
4. A mock interview question based on the concepts used in the code.

Format the output strictly as JSON with the following structure:
{{
  "overview": "...",
  "suggestions": ["...", "..."],
  "score": 8,
  "interview_question": "..."
}}

Code to review:
```{request.language}
{request.code}
```
"""
    try:
        response = model.generate_content(prompt)
        # Strip markdown json block if any
        text = response.text.strip()
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
            
        data = json.loads(text.strip())
        return data
    except Exception as e:
        logger.error(f"Error during AI code review: {e}")
        raise HTTPException(status_code=500, detail="Error generating AI review.")
