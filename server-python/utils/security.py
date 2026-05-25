import re
import bleach
from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

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
