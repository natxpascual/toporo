"""Pydantic domain models and subscription state helpers for Toporo Users."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

UserRole = Literal["user", "admin"]
UserStatus = Literal["pending_verification", "pending_password", "active", "suspended"]
PlanTier = Literal["free", "pro"]


def utc_now() -> datetime:
    """Return timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


def parse_iso_dt(value: Optional[str]) -> Optional[datetime]:
    """Parse ISO-8601 UTC timestamp safely."""
    if not value:
        return None
    try:
        dt = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


class UserRecord(BaseModel):
    """Canonical single-table user entity stored in Azure Table Storage or local JSON."""

    user_id: str
    email: str
    username: str
    full_name: str = ""
    password_hash: Optional[str] = None
    auth_providers: List[str] = Field(default_factory=lambda: ["local"])
    google_sub: Optional[str] = None
    github_id: Optional[str] = None
    role: UserRole = "user"
    status: UserStatus = "pending_verification"
    email_verified: bool = False
    otp_code_hash: Optional[str] = None
    otp_expires_at: Optional[str] = None
    otp_attempts: int = 0
    plan: PlanTier = "free"
    trial_availed: bool = False
    trial_started_at: Optional[str] = None
    trial_ends_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: utc_now().isoformat())
    last_login_at: Optional[str] = None


class SubscriptionState(BaseModel):
    """Computed subscription and trial lifecycle attributes."""

    base_plan: PlanTier
    effective_plan: PlanTier
    trial_availed: bool
    is_trial_active: bool
    trial_started_at: Optional[str] = None
    trial_ends_at: Optional[str] = None
    trial_days_remaining: int = 0
    should_prompt_trial: bool
    should_nudge_upgrade_30m: bool


def compute_subscription_state(user: UserRecord, now: Optional[datetime] = None) -> SubscriptionState:
    """Compute effective Pro access, 7-day trial countdown, and modal triggers."""
    current = now or utc_now()
    trial_end = parse_iso_dt(user.trial_ends_at)
    is_trial_active = bool(
        user.plan == "free"
        and user.trial_availed
        and trial_end is not None
        and current < trial_end
    )

    days_remaining = 0
    if is_trial_active and trial_end is not None:
        seconds_left = max(0.0, (trial_end - current).total_seconds())
        days_remaining = max(1, int((seconds_left + 86399) // 86400))

    effective_plan: PlanTier = "pro" if (user.plan == "pro" or is_trial_active) else "free"
    should_prompt_trial = bool(effective_plan == "free" and not user.trial_availed)
    should_nudge_upgrade_30m = bool(effective_plan == "free" and user.trial_availed)

    return SubscriptionState(
        base_plan=user.plan,
        effective_plan=effective_plan,
        trial_availed=user.trial_availed,
        is_trial_active=is_trial_active,
        trial_started_at=user.trial_started_at,
        trial_ends_at=user.trial_ends_at,
        trial_days_remaining=days_remaining,
        should_prompt_trial=should_prompt_trial,
        should_nudge_upgrade_30m=should_nudge_upgrade_30m,
    )


def serialize_public_user(user: UserRecord, now: Optional[datetime] = None) -> Dict[str, Any]:
    """Return sanitized user payload safe for API responses (strips password_hash & OTP)."""
    sub = compute_subscription_state(user, now=now)
    return {
        "userId": user.user_id,
        "email": user.email,
        "username": user.username,
        "fullName": user.full_name,
        "authProviders": user.auth_providers,
        "role": user.role,
        "status": user.status,
        "emailVerified": user.email_verified,
        "plan": user.plan,
        "effectivePlan": sub.effective_plan,
        "trialAvailed": sub.trial_availed,
        "isTrialActive": sub.is_trial_active,
        "trialStartedAt": sub.trial_started_at,
        "trialEndsAt": sub.trial_ends_at,
        "trialDaysRemaining": sub.trial_days_remaining,
        "shouldPromptTrial": sub.should_prompt_trial,
        "shouldNudgeUpgrade30m": sub.should_nudge_upgrade_30m,
        "createdAt": user.created_at,
        "lastLoginAt": user.last_login_at,
    }


# ── API Request Schemas ──────────────────────────────────────────────────────


class SignupEmailRequest(BaseModel):
    email: str


class VerifyEmailOtpRequest(BaseModel):
    email: str
    otpCode: str


class ResendOtpRequest(BaseModel):
    email: str


class SetupPasswordRequest(BaseModel):
    email: str
    setupToken: str
    password: str
    fullName: Optional[str] = None
    username: Optional[str] = None


class LoginRequest(BaseModel):
    identifier: str
    password: str
    rememberMe: bool = True
    elevate: bool = False


class AdminUpdateUserRequest(BaseModel):
    plan: Optional[PlanTier] = None
    role: Optional[UserRole] = None
    status: Optional[UserStatus] = None
    emailVerified: Optional[bool] = None
    resetTrial: Optional[bool] = None
    fullName: Optional[str] = None

