"""
Certificate Generator & QR Verification Router
Implements endpoints for dynamic event certificate generation and public QR verification.

Routes:
  POST /certificates/generate         — Admin: generate certificates for an event
  GET  /certificates/verify/{id}      — Public: verify a certificate by its unique ID
  GET  /certificates/{id}/download    — Download a generated certificate image
"""

import io
import os
import uuid
import hashlib
import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, Header, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/certificates", tags=["certificates"])

# ---------------------------------------------------------------------------
# In-memory store (replace with a database in production).
# Keys: certificate_id (str), Values: CertificateRecord dict.
# ---------------------------------------------------------------------------
_CERTIFICATE_STORE: dict[str, dict] = {}

# ---------------------------------------------------------------------------
# Admin auth helper — simple shared-secret check matching existing project
# pattern. Replace with JWT / session-based auth when available.
# ---------------------------------------------------------------------------
ADMIN_SECRET = os.getenv("ADMIN_SECRET", "nexasphere-admin-secret")


def _require_admin(x_admin_secret: Optional[str] = Header(default=None)) -> None:
    """Dependency that enforces admin authentication via X-Admin-Secret header."""
    if x_admin_secret != ADMIN_SECRET:
        raise HTTPException(status_code=401, detail="Unauthorized: invalid admin secret")


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class StudentCertificateRequest(BaseModel):
    student_id: str = Field(..., description="Unique student identifier")
    student_name: str = Field(..., min_length=1, max_length=200)
    email: Optional[str] = Field(default=None, description="Student email for dedup")


class GenerateCertificatesRequest(BaseModel):
    event_id: str = Field(..., description="Unique event identifier")
    event_name: str = Field(..., min_length=1, max_length=300)
    event_date: str = Field(..., description="Human-readable event date, e.g. 'March 15, 2025'")
    students: list[StudentCertificateRequest] = Field(..., min_length=1)
    template_style: Optional[str] = Field(
        default="default",
        description="Certificate template style: 'default' | 'gold' | 'silver'"
    )


class CertificateRecord(BaseModel):
    certificate_id: str
    student_id: str
    student_name: str
    event_id: str
    event_name: str
    issue_date: str
    verification_url: str
    status: str  # "valid" | "revoked"


class GenerateResponse(BaseModel):
    success: bool
    generated: int
    skipped: int  # already issued for this student+event combo
    certificates: list[CertificateRecord]


class VerifyResponse(BaseModel):
    valid: bool
    certificate: Optional[CertificateRecord] = None
    message: str


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _make_certificate_id(student_id: str, event_id: str) -> str:
    """Deterministic, collision-resistant certificate ID based on student+event."""
    seed = f"{student_id}:{event_id}:{ADMIN_SECRET}"
    digest = hashlib.sha256(seed.encode()).hexdigest()[:16]
    return f"NS-CERT-{digest.upper()}"


def _build_verification_url(cert_id: str) -> str:
    """Build the public verification URL for a certificate."""
    base = os.getenv("VITE_FRONTEND_URL", "https://nexasphere-glbajaj.vercel.app")
    return f"{base}/verify/{cert_id}"


def _generate_certificate_image(
    student_name: str,
    event_name: str,
    event_date: str,
    cert_id: str,
    verification_url: str,
    style: str = "default",
) -> bytes:
    """
    Generate a certificate PNG image using Pillow.
    Falls back to a minimal SVG-embedded PNG if Pillow is unavailable.
    """
    try:
        from PIL import Image, ImageDraw, ImageFont
        import qrcode

        # Canvas
        W, H = 1200, 850
        img = Image.new("RGB", (W, H), color="#0a0a0a")
        draw = ImageDraw.Draw(img)

        # --- Background gradient simulation (horizontal bands) ---
        for y in range(H):
            t = y / H
            r = int(10 + t * 8)
            g = int(10 + t * 5)
            b = int(10 + t * 12)
            draw.line([(0, y), (W, y)], fill=(r, g, b))

        # --- Decorative border ---
        accent = {"default": (204, 17, 17), "gold": (218, 165, 32), "silver": (192, 192, 192)}
        color = accent.get(style, accent["default"])
        border_w = 6
        draw.rectangle([border_w, border_w, W - border_w, H - border_w], outline=color, width=border_w)
        draw.rectangle([border_w + 10, border_w + 10, W - border_w - 10, H - border_w - 10],
                       outline=(*color, 80), width=1)

        # --- Corner ornaments ---
        ornament_size = 30
        for cx, cy in [(border_w + 18, border_w + 18), (W - border_w - 18, border_w + 18),
                       (border_w + 18, H - border_w - 18), (W - border_w - 18, H - border_w - 18)]:
            draw.ellipse([cx - ornament_size // 2, cy - ornament_size // 2,
                          cx + ornament_size // 2, cy + ornament_size // 2],
                         fill=color, outline=None)

        # --- Fonts (use default PIL font as fallback) ---
        try:
            font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
            font_name = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 52)
            font_body = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 20)
            font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 14)
        except Exception:
            font_title = font_name = font_body = font_small = ImageFont.load_default()

        # --- Header ---
        draw.text((W // 2, 80), "NexaSphere — GL Bajaj", fill=color, font=font_title, anchor="mm")
        draw.text((W // 2, 115), "Certificate of Participation", fill=(200, 200, 200), font=font_body, anchor="mm")

        # --- Divider line ---
        draw.line([(120, 150), (W - 120, 150)], fill=color, width=2)

        # --- Body text ---
        draw.text((W // 2, 220), "This is to certify that", fill=(160, 160, 160), font=font_body, anchor="mm")
        draw.text((W // 2, 300), student_name, fill=(255, 255, 255), font=font_name, anchor="mm")

        draw.line([(W // 2 - 200, 340), (W // 2 + 200, 340)], fill=color, width=1)

        draw.text((W // 2, 380), "has successfully participated in", fill=(160, 160, 160), font=font_body, anchor="mm")
        draw.text((W // 2, 430), event_name, fill=color, font=font_title, anchor="mm")

        draw.text((W // 2, 490), f"Held on: {event_date}", fill=(140, 140, 140), font=font_small, anchor="mm")

        # --- Footer ---
        draw.line([(120, 680), (W - 120, 680)], fill=(*color, 100), width=1)
        draw.text((200, 720), "NexaSphere Tech Ecosystem", fill=(120, 120, 120), font=font_small, anchor="mm")
        draw.text((200, 740), "GL Bajaj Group of Institutions", fill=(100, 100, 100), font=font_small, anchor="mm")
        draw.text((W // 2, 720), f"Certificate ID: {cert_id}", fill=(100, 100, 100), font=font_small, anchor="mm")

        # --- QR Code ---
        qr = qrcode.QRCode(version=1, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=5, border=2)
        qr.add_data(verification_url)
        qr.make(fit=True)
        qr_img = qr.make_image(fill_color=color, back_color=(10, 10, 10))
        qr_img = qr_img.resize((140, 140), Image.LANCZOS)
        img.paste(qr_img, (W - 170, H - 190))
        draw.text((W - 100, H - 40), "Scan to verify", fill=(100, 100, 100), font=font_small, anchor="mm")

        # --- Serialize to bytes ---
        buf = io.BytesIO()
        img.save(buf, format="PNG", optimize=True)
        return buf.getvalue()

    except ImportError:
        logger.warning("Pillow/qrcode not installed — returning placeholder PNG bytes")
        return _minimal_placeholder_png(student_name, cert_id)


def _minimal_placeholder_png(student_name: str, cert_id: str) -> bytes:
    """Returns a tiny 1×1 transparent PNG as last-resort fallback."""
    # 68-byte minimal valid PNG (1×1 pixel transparent)
    import base64
    minimal = (
        b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01"
        b"\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\nIDATx\x9cc\x00\x01"
        b"\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82"
    )
    return minimal


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post("/generate", response_model=GenerateResponse, status_code=201)
async def generate_certificates(
    body: GenerateCertificatesRequest,
    _: None = Depends(_require_admin),
):
    """
    Admin-only: generate certificates for a list of students for a given event.
    Already-issued certificates (same student_id + event_id) are skipped.
    """
    generated = []
    skipped = 0
    issue_date = datetime.now(timezone.utc).strftime("%B %d, %Y")

    for student in body.students:
        cert_id = _make_certificate_id(student.student_id, body.event_id)

        # Idempotency — skip if already exists
        if cert_id in _CERTIFICATE_STORE:
            skipped += 1
            continue

        verification_url = _build_verification_url(cert_id)

        record = {
            "certificate_id": cert_id,
            "student_id": student.student_id,
            "student_name": student.student_name,
            "event_id": body.event_id,
            "event_name": body.event_name,
            "issue_date": issue_date,
            "verification_url": verification_url,
            "template_style": body.template_style or "default",
            "status": "valid",
        }
        _CERTIFICATE_STORE[cert_id] = record
        generated.append(CertificateRecord(**{k: v for k, v in record.items() if k != "template_style"}))

    logger.info(
        "Certificate generation complete",
        extra={"event_id": body.event_id, "generated": len(generated), "skipped": skipped},
    )

    return GenerateResponse(
        success=True,
        generated=len(generated),
        skipped=skipped,
        certificates=generated,
    )


@router.get("/verify/{certificate_id}", response_model=VerifyResponse)
async def verify_certificate(certificate_id: str):
    """
    Public endpoint: verify a certificate by its unique ID.
    Safe for unauthenticated access — returns only public fields.
    """
    # Sanitize input
    cert_id = certificate_id.strip().upper()
    if len(cert_id) > 60 or not cert_id.startswith("NS-CERT-"):
        raise HTTPException(status_code=400, detail="Invalid certificate ID format")

    record = _CERTIFICATE_STORE.get(cert_id)

    if not record:
        return VerifyResponse(
            valid=False,
            certificate=None,
            message="Certificate not found. It may have been revoked or does not exist.",
        )

    if record.get("status") == "revoked":
        return VerifyResponse(
            valid=False,
            certificate=None,
            message="This certificate has been revoked.",
        )

    return VerifyResponse(
        valid=True,
        certificate=CertificateRecord(**{k: v for k, v in record.items() if k != "template_style"}),
        message="Certificate verified successfully.",
    )


@router.get("/{certificate_id}/download")
async def download_certificate(certificate_id: str):
    """
    Download the certificate image PNG for a given certificate ID.
    Public endpoint — image contains only non-sensitive display data.
    """
    cert_id = certificate_id.strip().upper()
    record = _CERTIFICATE_STORE.get(cert_id)

    if not record or record.get("status") == "revoked":
        raise HTTPException(status_code=404, detail="Certificate not found")

    img_bytes = _generate_certificate_image(
        student_name=record["student_name"],
        event_name=record["event_name"],
        event_date=record["issue_date"],
        cert_id=cert_id,
        verification_url=record["verification_url"],
        style=record.get("template_style", "default"),
    )

    safe_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in record["student_name"])
    filename = f"NexaSphere_Certificate_{safe_name}_{cert_id}.png"

    return Response(
        content=img_bytes,
        media_type="image/png",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("", include_in_schema=False)
async def list_certificates_healthcheck():
    """Internal: returns certificate store count for health checks."""
    return {"total_certificates": len(_CERTIFICATE_STORE)}
