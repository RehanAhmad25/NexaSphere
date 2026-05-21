import logging
import os
import google.generativeai as genai
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# 1. Configuration & Persona
# This instruction tells the bot exactly how to behave and what NexaSphere is.
SYSTEM_PROMPT = """
You are Nexa-AI, the official digital assistant for NexaSphere, GL Bajaj's student-driven tech ecosystem. 
Your tone is futuristic, helpful, and professional.

About NexaSphere:
- Goal: To foster innovation, learning, and collaboration among students.
- Structure: Includes sections for Activities (coding, workshops), Events (hackathons, sessions), and a Core Team.
- Call to Action: Encourage users to 'Join as Member' or 'Apply for Core Team' if they seem interested.

If asked about something unrelated to tech or NexaSphere, politely steer the conversation back to the ecosystem or provide general tech guidance.
"""

# 2. Initialize Gemini
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    logger.warning("GEMINI_API_KEY is not configured. AI Chat will not work.")
    model = None
else:
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(
        model_name='gemini-3.1-flash-lite-preview'
    )

app = FastAPI(title="NexaSphere AI Core")

@app.get("/")
async def root():
    return {"message": "NexaSphere AI Core API is running. Visit /docs for Swagger API documentation."}

from routers import forms, recommend, notifications, review
app.include_router(forms.router)
app.include_router(recommend.router)
app.include_router(notifications.router)
app.include_router(review.router)
# 3. CORS Configuration
origins = os.getenv("CORS_ORIGIN", "http://localhost:5173,http://localhost:5174,https://nexasphere-glbajaj.vercel.app,https://admin-nexasphere.vercel.app,https://nexa-sphere-sigma.vercel.app,https://admin-dashboard-navy-pi-22.vercel.app").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# 4. Chat Endpoint
@app.post("/ai/chat")
async def chat_with_ai(request: ChatRequest):
    try:
        if not model:
            return {"reply": "Nexa-AI Core is offline. (GEMINI_API_KEY missing)"}
            
        # We send the user message to the model along with system instructions manually
        full_prompt = f"System Instruction:\n{SYSTEM_PROMPT}\n\nUser Message:\n{request.message}"
        response = model.generate_content(full_prompt)
        
        if not response.text:
            return {"reply": "Nexa-AI is processing, but returned an empty signal. Try rephrasing."}
            
        return {"reply": response.text}

    except Exception as e:
        error_code = getattr(e, "status_code", None)
        logger.warning(
            "Gemini request failed",
            extra={"error_type": type(e).__name__, "status_code": error_code},
        )
        
        # Friendly error handling for Quota limits
        if error_code == 429 or getattr(getattr(e, "response", None), "status_code", None) == 429:
            return {"reply": "Nexa-AI is currently at peak capacity (Quota Limit). Please wait 60 seconds."}
        
        return {"reply": "Nexa-AI Core Offline. Connection recalibrating..."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)