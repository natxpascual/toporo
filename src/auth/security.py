"""Cryptographic helpers for passwords, OTP codes, and JWT session tokens."""

from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional

import bcrypt
import jwt

from src.auth.config import get_auth_settings


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using bcrypt with a random salt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(plain_password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, password_hash: Optional[str]) -> bool:
    """Verify a plaintext password against a stored bcrypt hash."""
    if not password_hash:
        return False
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), password_hash.encode("utf-8"))
    except Exception:
        return False


def generate_six_digit_otp() -> str:
    """Generate a cryptographically random 6-digit numeric OTP."""
    return f"{secrets.randbelow(900000) + 100000:06d}"


def hash_otp(email: str, otp_code: str) -> str:
    """Compute keyed SHA-256 hash of email + 6-digit OTP."""
    settings = get_auth_settings()
    payload = f"{email.strip().lower()}:{otp_code.strip()}:{settings.jwt_secret_key}"
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def verify_otp_hash(email: str, otp_code: str, stored_hash: Optional[str]) -> bool:
    """Constant-time verification of a 6-digit OTP against stored SHA-256 hash."""
    if not stored_hash:
        return False
    candidate = hash_otp(email, otp_code)
    return hmac.compare_digest(candidate, stored_hash)


def create_access_token(
    *,
    email: str,
    user_id: str,
    role: str,
    elevated: bool = False,
    remember_me: bool = True,
) -> tuple[str, str]:
    """Mint signed JWT access token and return (token, expires_at_iso)."""
    settings = get_auth_settings()
    now = datetime.now(timezone.utc)
    if elevated:
        ttl_minutes = settings.jwt_elevated_expire_minutes
    elif remember_me:
        ttl_minutes = settings.jwt_access_expire_minutes
    else:
        ttl_minutes = 60 * 12  # 12 hours when Remember Me is unchecked

    exp = now + timedelta(minutes=ttl_minutes)
    payload: Dict[str, Any] = {
        "sub": email.strip().lower(),
        "uid": user_id,
        "role": role,
        "elevated": elevated,
        "purpose": "session",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")
    return token, exp.isoformat()


def create_password_setup_token(email: str) -> str:
    """Mint short-lived (15m) token authorizing Step 3 password creation after OTP."""
    settings = get_auth_settings()
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=15)
    payload: Dict[str, Any] = {
        "sub": email.strip().lower(),
        "purpose": "password_setup",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def create_oauth_state_token(provider: str, elevate: bool = False) -> str:
    """Mint signed CSRF state token for Google/GitHub OAuth 2.0 flow."""
    settings = get_auth_settings()
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=10)
    payload: Dict[str, Any] = {
        "provider": provider,
        "elevate": elevate,
        "nonce": secrets.token_urlsafe(16),
        "purpose": "oauth_state",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm="HS256")


def decode_token(token: str, expected_purpose: Optional[str] = None) -> Dict[str, Any]:
    """Decode and validate a signed JWT token."""
    settings = get_auth_settings()
    payload = jwt.decode(token, settings.jwt_secret_key, algorithms=["HS256"])
    if expected_purpose and payload.get("purpose") != expected_purpose:
        raise jwt.InvalidTokenError("Invalid token purpose")
    return payload

