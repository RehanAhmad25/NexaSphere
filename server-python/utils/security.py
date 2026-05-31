import re
import os
import bleach
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import redis

# 1. Rate Limiting Setup
# Uses the remote IP address as the identifier for rate limits
limiter = Limiter(key_func=get_remote_address)

# 2. Advanced Input Sanitization
def sanitize_text(value: str | None) -> str | None:
    """
    Sanitizes user input to prevent XSS and reduce SQL injection risks.
    Strips HTML tags using bleach, and removes obvious suspicious SQL keywords.
    """
    if not value:
        return value
        
    # Strip HTML and JS payload tags
    clean_value = bleach.clean(value, tags=[], attributes={}, strip=True)
    
    # Optional: Light regex scrubbing for obvious SQL-like injections 
    # (though ORMs/parameterized queries are the primary defense)
    # We remove patterns like: DROP TABLE, INSERT INTO, OR 1=1
    suspicious_patterns = [
        r"(?i)\bDROP\s+TABLE\b",
        r"(?i)\bINSERT\s+INTO\b",
        r"(?i)\bOR\s+1\s*=\s*1\b"
    ]
    
    for pattern in suspicious_patterns:
        clean_value = re.sub(pattern, "", clean_value)
        
    # Remove excessive repeated whitespace
    clean_value = re.sub(r"\s+", " ", clean_value).strip()
    
    return clean_value

# 3. Redis-backed JWT Blacklist / Revocation (Issue #805)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = None

try:
    # Attempt to initialize Redis connection
    redis_client = redis.from_url(REDIS_URL, socket_connect_timeout=2, decode_responses=True)
except Exception:
    # Fallback to local memory storage if Redis is offline/unavailable in dev
    redis_client = None

# Fallback in-memory blacklist for high-availability robustness
_local_blacklist = set()

def blacklist_token(token: str, expire_seconds: int = 3600) -> bool:
    """Blacklists a JWT token signature for the remainder of its TTL."""
    if redis_client:
        try:
            redis_client.setex(f"blacklist:{token}", expire_seconds, "true")
            return True
        except Exception:
            pass
    
    # Fallback to in-memory store
    _local_blacklist.add(token)
    return True

def is_token_blacklisted(token: str) -> bool:
    """Checks if a token is registered as revoked/blacklisted."""
    if redis_client:
        try:
            return redis_client.exists(f"blacklist:{token}") > 0
        except Exception:
            pass
    
    return token in _local_blacklist

# 4. FastAPI Bearer Token Revocation Dependency
security_bearer = HTTPBearer()

async def verify_jwt_with_blacklist(credentials: HTTPAuthorizationCredentials = Security(security_bearer)) -> str:
    """FastAPI Dependency to verify JWT signature status against the Redis blacklist."""
    token = credentials.credentials
    if is_token_blacklisted(token):
        raise HTTPException(
            status_code=401,
            detail="Token has been revoked or blacklisted"
        )
    return token
