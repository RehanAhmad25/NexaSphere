import time
import os
from fastapi import APIRouter, Response
from typing import Dict, Any

router = APIRouter()

@router.get("/health", response_model=Dict[str, Any])
async def health_check(response: Response):
    """
    Production-grade health probe.
    Checks external dependencies gracefully and returns structured APM metrics.
    """
    start_time = time.time()
    
    health_status = {
        "status": "ok",
        "dependencies": {
            "supabase": "unknown",
            "google_sheets": "unknown",
            "gemini": "unknown"
        },
        "latency_ms": 0
    }
    
    # 1. Supabase Check (Configuration-based probe to save requests)
    if os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_SERVICE_ROLE_KEY"):
        health_status["dependencies"]["supabase"] = "configured"
    else:
        health_status["dependencies"]["supabase"] = "missing_config"
        health_status["status"] = "degraded"
        
    # 2. Google Sheets Check
    if os.getenv("GOOGLE_PRIVATE_KEY") and "dummy" not in os.getenv("GOOGLE_PRIVATE_KEY"):
        health_status["dependencies"]["google_sheets"] = "configured"
    else:
        health_status["dependencies"]["google_sheets"] = "offline_dev_mode"
        
    # 3. Gemini Configuration Check
    if os.getenv("GEMINI_API_KEY"):
        health_status["dependencies"]["gemini"] = "configured"
    else:
        health_status["dependencies"]["gemini"] = "missing_config"
        health_status["status"] = "degraded"
        
    # Calculate Latency
    latency = round((time.time() - start_time) * 1000, 2)
    health_status["latency_ms"] = latency
    
    # Set proper HTTP status
    if health_status["status"] == "degraded":
        # Using 200 for degraded to prevent orchestration restarts, 
        # but the JSON payload informs APM tools of the issue.
        response.status_code = 200
        
    return health_status
