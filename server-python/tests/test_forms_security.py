import pytest
from fastapi.testclient import TestClient
from main import app
from models.forms import FormSubmission

client = TestClient(app)

def test_rate_limiting():
    # Send 6 requests, 6th should be blocked by 5/hour limit
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "whatsapp": "9876543210",
        "year": "1st Year",
        "branch": "CSE",
        "section": "A",
        "reason": "testing"
    }
    
    # Send 5 allowed requests
    for i in range(5):
        response = client.post("/api/forms/membership", json=payload)
        assert response.status_code in (200, 500) # 500 if Supabase/Sheets aren't configured, but 429 means blocked
        
    # 6th request should fail
    response = client.post("/api/forms/membership", json=payload)
    assert response.status_code == 429

def test_xss_sanitization():
    # Test Pydantic model directly to ensure the validator strips XSS
    payload = {
        "name": "Hacker <script>alert(1)</script>",
        "email": "test@example.com",
        "whatsapp": "9876543210",
        "year": "1st Year",
        "branch": "CSE DROP TABLE users",
        "section": "A",
        "reason": "I want to join <b>badly</b>! <iframe src='malicious.com'></iframe>"
    }
    
    submission = FormSubmission(**payload)
    
    # name should be stripped of tags
    assert "<script>" not in submission.name
    # bleach removes tags, leaving content (or removes entirely depending on config)
    assert submission.name == "Hacker alert(1)"
    
    # reason should be stripped of tags
    assert "<iframe>" not in submission.reason
    assert submission.reason == "I want to join badly!"
    
    # branch should be stripped of SQL
    assert "DROP TABLE" not in submission.branch

def test_invalid_email_rejected():
    payload = {
        "name": "Test User",
        "email": "not-an-email",
        "whatsapp": "9876543210",
        "year": "1st Year",
        "branch": "CSE",
        "section": "A"
    }
    response = client.post("/api/forms/membership", json=payload)
    assert response.status_code == 422 # Pydantic validation error

def test_invalid_whatsapp_rejected():
    payload = {
        "name": "Test User",
        "email": "test@example.com",
        "whatsapp": "12345", # Too short
        "year": "1st Year",
        "branch": "CSE",
        "section": "A"
    }
    response = client.post("/api/forms/membership", json=payload)
    assert response.status_code == 422
