from fastapi import APIRouter, HTTPException, Body
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

router = APIRouter(
    prefix="/portfolio",
    tags=["portfolio"]
)

# In-memory datastore for portfolios (keyed by username)
_PORTFOLIOS: Dict[str, dict] = {}

class VisibleSections(BaseModel):
    quests: bool = True
    roadmaps: bool = True
    projects: bool = True

class SocialLinks(BaseModel):
    github: str = ""
    linkedin: str = ""
    twitter: str = ""
    resume: str = ""

class SeoMetadata(BaseModel):
    title: str = ""
    description: str = ""

class PortfolioPayload(BaseModel):
    username: str
    passkey: str
    title: str = ""
    bio: str = ""
    theme: str = "glassmorphic"
    customDomain: str = ""
    visibleSections: VisibleSections = VisibleSections()
    socialLinks: SocialLinks = SocialLinks()
    seoMetadata: SeoMetadata = SeoMetadata()
    skills: List[str] = []
    roadmaps: List[str] = []
    projects: List[str] = []

@router.put("/")
async def update_portfolio(payload: PortfolioPayload):
    username = payload.username.lower()
    
    # Enforce passkey validation if portfolio already exists
    if username in _PORTFOLIOS:
        existing = _PORTFOLIOS[username]
        if existing["passkey"] != payload.passkey:
            raise HTTPException(status_code=403, detail="Invalid passkey for this portfolio. Cannot overwrite.")
            
    # Save portfolio
    _PORTFOLIOS[username] = payload.model_dump()
    return {"status": "success", "message": f"Portfolio for {username} saved successfully."}

@router.get("/{username}")
async def get_portfolio(username: str):
    username = username.lower()
    if username not in _PORTFOLIOS:
        raise HTTPException(status_code=404, detail="Portfolio not found.")
        
    data = _PORTFOLIOS[username].copy()
    # Strip passkey before returning public data
    data.pop("passkey", None)
    return data
