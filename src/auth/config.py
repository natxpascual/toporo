"""Environment configuration for Toporo Auth, Storage, Email OTP, and OAuth."""

from __future__ import annotations

import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root if present (without overriding explicit OS env vars)
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env", override=False)


@dataclass(frozen=True)
class AuthSettings:
    """Immutable configuration settings loaded from environment variables."""

    jwt_secret_key: str
    jwt_access_expire_minutes: int
    jwt_elevated_expire_minutes: int
    admin_email: str
    admin_username: str
    admin_initial_password: str
    admin_full_name: str
    azure_storage_connection_string: str
    azure_users_table_name: str
    local_db_path: str
    resend_api_key: str
    email_from_address: str
    google_client_id: str
    google_client_secret: str
    google_redirect_uri: str
    github_client_id: str
    github_client_secret: str
    github_redirect_uri: str
    frontend_base_url: str


@lru_cache(maxsize=1)
def get_auth_settings() -> AuthSettings:
    """Return cached auth configuration from environment variables."""
    default_db_path = str(PROJECT_ROOT / "data" / "toporo_users.json")
    return AuthSettings(
        jwt_secret_key=os.getenv(
            "JWT_SECRET_KEY",
            "toporo-dev-ephemeral-secret-change-in-production-64chars-minimum",
        ),
        jwt_access_expire_minutes=int(os.getenv("JWT_ACCESS_EXPIRE_MINUTES", "10080")),
        jwt_elevated_expire_minutes=int(os.getenv("JWT_ELEVATED_EXPIRE_MINUTES", "30")),
        admin_email=os.getenv("ADMIN_EMAIL", "admin@toporo.dev").strip().lower(),
        admin_username=os.getenv("ADMIN_USERNAME", "admin").strip().lower(),
        admin_initial_password=os.getenv("ADMIN_INITIAL_PASSWORD", "Admin@Toporo2026!"),
        admin_full_name=os.getenv("ADMIN_FULL_NAME", "Toporo Platform Administrator"),
        azure_storage_connection_string=os.getenv("AZURE_STORAGE_CONNECTION_STRING", "").strip(),
        azure_users_table_name=os.getenv("AZURE_USERS_TABLE_NAME", "ToporoUsers").strip(),
        local_db_path=os.getenv("TOPORO_LOCAL_USERS_DB", default_db_path),
        resend_api_key=os.getenv("RESEND_API_KEY", "").strip(),
        email_from_address=os.getenv("EMAIL_FROM_ADDRESS", "Toporo Security <no-reply@toporo.dev>"),
        google_client_id=os.getenv("GOOGLE_CLIENT_ID", "").strip(),
        google_client_secret=os.getenv("GOOGLE_CLIENT_SECRET", "").strip(),
        google_redirect_uri=os.getenv(
            "GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/oauth/google/callback"
        ).strip(),
        github_client_id=os.getenv("GITHUB_CLIENT_ID", "").strip(),
        github_client_secret=os.getenv("GITHUB_CLIENT_SECRET", "").strip(),
        github_redirect_uri=os.getenv(
            "GITHUB_REDIRECT_URI", "http://localhost:8000/api/auth/oauth/github/callback"
        ).strip(),
        frontend_base_url=os.getenv("FRONTEND_BASE_URL", "http://localhost:3000").rstrip("/"),
    )

