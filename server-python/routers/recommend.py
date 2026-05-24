import os
import json
import redis
import logging
from fastapi import APIRouter, HTTPException
from services.recommendation_logic import compute_hybrid_recommendations

import time

router = APIRouter()
logger = logging.getLogger(__name__)

# Fallback Cache Dict
LOCAL_CACHE = {}

# Initialize Redis client
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = None
try:
    # Try to ping the server to catch connection errors instantly
    temp_redis = redis.from_url(redis_url, socket_connect_timeout=1)
    temp_redis.ping()
    redis_client = temp_redis
except redis.exceptions.ConnectionError:
    logger.warning("Redis unavailable, using local cache")
except Exception as e:
    logger.warning("Redis unavailable, using local cache")

@router.get("/recommend/events/{user_id}", tags=["Recommendations"], summary="Get Event Recommendations", description="Get top 5 recommended events for a specific user based on hybrid content and collaborative filtering.")
async def recommend_events(user_id: str):
    cache_key = f"recs:events:{user_id}"
    
    # 1. Check Caches
    if redis_client:
        try:
            cached_result = redis_client.get(cache_key)
            if cached_result:
                return json.loads(cached_result)
        except Exception:
            pass # fallback to computing
    else:
        # Check local cache
        if cache_key in LOCAL_CACHE:
            entry = LOCAL_CACHE[cache_key]
            if time.time() < entry["expires"]:
                return entry["data"]
            
    # 2. Compute Recommendations if not in cache
    try:
        recommendations = compute_hybrid_recommendations(user_id, num_recommendations=5)
    except Exception as e:
        logger.error(f"Error computing recommendations: {e}")
        raise HTTPException(status_code=500, detail="Error computing recommendations")
        
    # 3. Store in Cache for 1 hour (3600 seconds)
    if redis_client and recommendations:
        try:
            redis_client.setex(cache_key, 3600, json.dumps(recommendations))
        except Exception:
            pass
    elif recommendations:
        LOCAL_CACHE[cache_key] = {
            "data": recommendations,
            "expires": time.time() + 3600
        }
            
    return recommendations
