from typing import Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
import re
from utils.security import sanitize_text

ALLOWED_YEARS = {"1st Year", "2nd Year", "3rd Year", "4th Year"}

class FormSubmission(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, strip_whitespace=True)
    email: EmailStr
    whatsapp: str = Field(..., min_length=10, max_length=10)
    year: str = Field(..., max_length=20)
    branch: str = Field(..., min_length=2, max_length=100, strip_whitespace=True)
    section: str = Field(..., max_length=1)
    reason: Optional[str] = Field(None, max_length=1000)

    @field_validator("name", "branch", "reason", mode="before")
    @classmethod
    def sanitize_text_fields(cls, v):
        if isinstance(v, str):
            return sanitize_text(v)
        return v

    @field_validator("name")
    @classmethod
    def name_must_be_valid(cls, v):
        if not re.match(r"^[a-zA-Z\s'\-]+$", v):
            raise ValueError("Name can only contain letters, spaces, hyphens, and apostrophes")
        return v

    @field_validator("whatsapp")
    @classmethod
    def whatsapp_must_be_valid(cls, v):
        if not re.fullmatch(r"[6-9]\d{9}", v):
            raise ValueError("WhatsApp must be a valid 10-digit Indian mobile number starting with 6-9")
        return v

    @field_validator("year")
    @classmethod
    def year_must_be_valid(cls, v):
        if v not in ALLOWED_YEARS:
            raise ValueError(f"Year must be one of: {', '.join(sorted(ALLOWED_YEARS))}")
        return v

    @field_validator("section")
    @classmethod
    def section_must_be_letter(cls, v):
        v = v.strip().upper()
        if not v.isalpha():
            raise ValueError("Section must be a single letter A-Z")
        return v

    model_config = {
        "json_schema_extra": {
            "example": {
                "name": "Priya Verma",
                "email": "priya.verma@example.com",
                "whatsapp": "9876543210",
                "year": "1st Year",
                "branch": "CSE (AI & ML)",
                "section": "B",
                "reason": "Passionate about technology and eager to contribute.",
            }
        }
    }