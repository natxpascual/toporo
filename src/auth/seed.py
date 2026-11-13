"""Startup seeding for the initial Administrator account from environment variables."""

from __future__ import annotations

import uuid
from typing import Optional

from src.auth.config import get_auth_settings
from src.auth.models import UserRecord, utc_now
from src.auth.security import hash_password, verify_password
from src.auth.user_repository import UserRepository, get_user_repository


def seed_admin_account(repo: Optional[UserRepository] = None) -> UserRecord:
    """Ensure the seeded admin account exists and matches .env configuration on startup."""
    repository = repo or get_user_repository()
    settings = get_auth_settings()

    existing = repository.get_by_email(settings.admin_email)
    if existing:
        changed = False
        if existing.role != "admin":
            existing.role = "admin"
            changed = True
        if not existing.email_verified:
            existing.email_verified = True
            changed = True
        if existing.status != "active":
            existing.status = "active"
            changed = True
        if settings.admin_initial_password and not verify_password(
            settings.admin_initial_password, existing.password_hash
        ):
            existing.password_hash = hash_password(settings.admin_initial_password)
            changed = True
        if changed:
            repository.upsert_user(existing)
        return existing

    admin_user = UserRecord(
        user_id=str(uuid.uuid4()),
        email=settings.admin_email,
        username=settings.admin_username,
        full_name=settings.admin_full_name,
        password_hash=hash_password(settings.admin_initial_password),
        auth_providers=["local"],
        role="admin",
        status="active",
        email_verified=True,
        plan="pro",
        trial_availed=False,
        created_at=utc_now().isoformat(),
    )
    repository.upsert_user(admin_user)
    repository.record_audit_event(
        event_type="ADMIN_SEEDED",
        actor="system",
        target=admin_user.email,
        detail="Initial administrator account provisioned from environment configuration.",
        severity="info",
    )
    return admin_user

