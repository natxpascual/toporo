"""FastAPI Authentication, RBAC, OAuth 2.0, Subscription Trial & Admin Router."""

from __future__ import annotations

import re
import uuid
from datetime import timedelta
from typing import Any, Dict, Optional
from urllib.parse import urlencode

import httpx
import jwt
from fastapi import APIRouter, Depends, Header, HTTPException, Query, status
from fastapi.responses import RedirectResponse

from src.auth.config import get_auth_settings
from src.auth.email_service import send_otp_email
from src.auth.models import (
    AdminUpdateUserRequest,
    LoginRequest,
    ResendOtpRequest,
    SetupPasswordRequest,
    SignupEmailRequest,
    UserRecord,
    VerifyEmailOtpRequest,
    compute_subscription_state,
    serialize_public_user,
    utc_now,
)
from src.auth.security import (
    create_access_token,
    create_oauth_state_token,
    create_password_setup_token,
    decode_token,
    generate_six_digit_otp,
    hash_otp,
    hash_password,
    verify_otp_hash,
    verify_password,
)
from src.auth.user_repository import UserRepository, get_user_repository

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
OTP_TTL_MINUTES = 10
MAX_OTP_ATTEMPTS = 5

auth_router = APIRouter(prefix="/api/auth", tags=["Authentication & Subscriptions"])
admin_router = APIRouter(prefix="/api/admin", tags=["Admin Portal"])


# ── FastAPI Auth & RBAC Dependencies ────────────────────────────────────────


def _extract_bearer_token(authorization: Optional[str]) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return authorization.split(" ", 1)[1].strip()


def get_current_auth_context(
    authorization: Optional[str] = Header(default=None),
    repo: UserRepository = Depends(get_user_repository),
) -> tuple[UserRecord, Dict[str, Any]]:
    """Validate Bearer JWT and return (UserRecord, decoded_claims)."""
    token = _extract_bearer_token(authorization)
    try:
        claims = decode_token(token, expected_purpose="session")
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )

    email = claims.get("sub", "")
    user = repo.get_by_email(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found.")
    if user.status == "suspended":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is suspended.")
    if not user.email_verified or user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account verification incomplete.")
    return user, claims


def get_current_user(
    ctx: tuple[UserRecord, Dict[str, Any]] = Depends(get_current_auth_context),
) -> UserRecord:
    """Return authenticated active UserRecord."""
    return ctx[0]


def require_pro_plan(
    user: UserRecord = Depends(get_current_user),
) -> UserRecord:
    """Enforce Toporo Pro subscription or active 7-day trial on server-side AI endpoints."""
    sub = compute_subscription_state(user)
    if sub.effective_plan != "pro":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "PRO_REQUIRED",
                "message": "Toporo Pro subscription or active 7-day trial is required to use AI Copilot features.",
            },
        )
    return user


def require_elevated_admin(
    ctx: tuple[UserRecord, Dict[str, Any]] = Depends(get_current_auth_context),
) -> UserRecord:
    """Enforce elevated admin session (role == 'admin' AND elevated == True)."""
    user, claims = ctx
    if user.role != "admin" or not claims.get("elevated"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Elevated administrator session required.",
        )
    return user


# ── 1. 3-Step Local Signup (Email -> 6-Digit OTP -> Password Setup) ─────────


@auth_router.post("/signup")
def signup_email_step(
    req: SignupEmailRequest,
    repo: UserRepository = Depends(get_user_repository),
):
    """Step 1: Register with email only and dispatch 6-digit OTP code."""
    email = req.email.strip().lower()
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    existing = repo.get_by_email(email)
    if existing:
        if existing.role == "admin":
            raise HTTPException(status_code=409, detail="This email address cannot be registered.")
        if existing.status == "suspended":
            raise HTTPException(status_code=403, detail="This account has been suspended.")
        if existing.email_verified and existing.password_hash:
            raise HTTPException(
                status_code=409,
                detail="An account with this email already exists. Please log in.",
            )

    otp_code = generate_six_digit_otp()
    otp_hash = hash_otp(email, otp_code)
    expires_at = (utc_now() + timedelta(minutes=OTP_TTL_MINUTES)).isoformat()

    if existing:
        existing.otp_code_hash = otp_hash
        existing.otp_expires_at = expires_at
        existing.otp_attempts = 0
        if not existing.email_verified:
            existing.status = "pending_verification"
        user = repo.upsert_user(existing)
    else:
        username = repo.generate_unique_username(email)
        user = UserRecord(
            user_id=str(uuid.uuid4()),
            email=email,
            username=username,
            full_name=email.split("@")[0].replace(".", " ").title(),
            password_hash=None,
            auth_providers=["local"],
            role="user",
            status="pending_verification",
            email_verified=False,
            otp_code_hash=otp_hash,
            otp_expires_at=expires_at,
            otp_attempts=0,
            plan="free",
            trial_availed=False,
        )
        repo.upsert_user(user)

    try:
        dev_hint = send_otp_email(email, otp_code)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    repo.record_audit_event(
        event_type="SIGNUP_OTP_SENT",
        actor=email,
        target=email,
        detail="6-digit verification code dispatched for new account registration.",
    )

    response: Dict[str, Any] = {
        "status": "otp_sent",
        "email": email,
        "message": "A 6-digit verification code has been sent to your email.",
        "expiresInMinutes": OTP_TTL_MINUTES,
    }
    if dev_hint:
        response["devOtpHint"] = dev_hint
    return response


@auth_router.post("/resend-otp")
def resend_otp(
    req: ResendOtpRequest,
    repo: UserRepository = Depends(get_user_repository),
):
    """Re-send a fresh 6-digit OTP to an unverified account."""
    email = req.email.strip().lower()
    user = repo.get_by_email(email)
    if not user or user.role == "admin":
        raise HTTPException(status_code=404, detail="Account not found.")
    if user.email_verified and user.password_hash:
        raise HTTPException(status_code=400, detail="Email is already verified. Please log in.")

    otp_code = generate_six_digit_otp()
    user.otp_code_hash = hash_otp(email, otp_code)
    user.otp_expires_at = (utc_now() + timedelta(minutes=OTP_TTL_MINUTES)).isoformat()
    user.otp_attempts = 0
    repo.upsert_user(user)

    try:
        dev_hint = send_otp_email(email, otp_code)
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    response: Dict[str, Any] = {
        "status": "otp_resent",
        "email": email,
        "message": "A new 6-digit verification code has been sent.",
    }
    if dev_hint:
        response["devOtpHint"] = dev_hint
    return response


@auth_router.post("/verify-email")
def verify_email_otp(
    req: VerifyEmailOtpRequest,
    repo: UserRepository = Depends(get_user_repository),
):
    """Step 2: Validate 6-digit OTP code and issue password setup token."""
    email = req.email.strip().lower()
    otp_code = req.otpCode.strip()
    if len(otp_code) != 6 or not otp_code.isdigit():
        raise HTTPException(status_code=400, detail="Please enter a valid 6-digit numeric code.")

    user = repo.get_by_email(email)
    if not user:
        raise HTTPException(status_code=404, detail="Account not found.")
    if user.otp_attempts >= MAX_OTP_ATTEMPTS:
        raise HTTPException(
            status_code=429,
            detail="Too many incorrect verification attempts. Please request a new code.",
        )

    from src.auth.models import parse_iso_dt

    expires_at = parse_iso_dt(user.otp_expires_at)
    if not expires_at or utc_now() > expires_at:
        raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")

    if not verify_otp_hash(email, otp_code, user.otp_code_hash):
        user.otp_attempts += 1
        repo.upsert_user(user)
        remaining = max(0, MAX_OTP_ATTEMPTS - user.otp_attempts)
        raise HTTPException(
            status_code=400,
            detail=f"Invalid verification code. {remaining} attempt(s) remaining.",
        )

    user.email_verified = True
    user.otp_code_hash = None
    user.otp_expires_at = None
    user.otp_attempts = 0
    if not user.password_hash:
        user.status = "pending_password"
    else:
        user.status = "active"
    repo.upsert_user(user)

    repo.record_audit_event(
        event_type="EMAIL_VERIFIED",
        actor=email,
        target=email,
        detail="Email address verified via 6-digit OTP.",
    )

    if not user.password_hash:
        setup_token = create_password_setup_token(email)
        return {
            "status": "password_setup_required",
            "email": email,
            "setupToken": setup_token,
            "message": "Email verified. Please set up your password to complete registration.",
        }

    # If user already had a password (e.g. legacy unverified), sign them in directly
    user.last_login_at = utc_now().isoformat()
    repo.upsert_user(user)
    token, expires_iso = create_access_token(
        email=user.email,
        user_id=user.user_id,
        role=user.role,
        elevated=False,
        remember_me=True,
    )
    return {
        "status": "authenticated",
        "accessToken": token,
        "expiresAt": expires_iso,
        "elevated": False,
        "user": serialize_public_user(user),
    }


@auth_router.post("/setup-password")
def setup_password_step(
    req: SetupPasswordRequest,
    repo: UserRepository = Depends(get_user_repository),
):
    """Step 3: Set account password after successful OTP verification and issue session JWT."""
    email = req.email.strip().lower()
    if len(req.password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long.")

    try:
        claims = decode_token(req.setupToken, expected_purpose="password_setup")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Password setup session expired. Please verify your email again.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid password setup token.")

    if claims.get("sub") != email:
        raise HTTPException(status_code=403, detail="Setup token does not match email address.")

    user = repo.get_by_email(email)
    if not user or not user.email_verified:
        raise HTTPException(status_code=400, detail="Email verification required before setting password.")

    if req.username:
        requested_username = req.username.strip().lower()
        existing_handle = repo.get_by_username(requested_username)
        if existing_handle and existing_handle.email != email:
            raise HTTPException(status_code=409, detail="Username is already taken.")
        user.username = requested_username

    if req.fullName and req.fullName.strip():
        user.full_name = req.fullName.strip()

    user.password_hash = hash_password(req.password)
    if "local" not in user.auth_providers:
        user.auth_providers.append("local")
    user.status = "active"
    user.plan = user.plan or "free"
    user.last_login_at = utc_now().isoformat()
    repo.upsert_user(user)

    repo.record_audit_event(
        event_type="ACCOUNT_ACTIVATED",
        actor=email,
        target=email,
        detail="User completed password setup and activated Free-tier account.",
    )

    token, expires_iso = create_access_token(
        email=user.email,
        user_id=user.user_id,
        role=user.role,
        elevated=False,
        remember_me=True,
    )
    return {
        "accessToken": token,
        "expiresAt": expires_iso,
        "elevated": False,
        "user": serialize_public_user(user),
    }


# ── 2. Username/Email + Password Login & Stealth Admin Elevation ────────────


@auth_router.post("/login")
def login_with_credentials(
    req: LoginRequest,
    repo: UserRepository = Depends(get_user_repository),
):
    """Authenticate user via email or username and password.

    Enforces Stealth Admin Isolation:
    - If an admin logs in WITHOUT elevate=True (?session=elevate), returns 'User does not exist'.
    - If a non-admin attempts elevate=True, returns 'User does not exist'.
    """
    identifier = req.identifier.strip().lower()
    if not identifier or not req.password:
        raise HTTPException(status_code=400, detail="Please enter your email/username and password.")

    user = repo.get_by_identifier(identifier)
    if not user:
        raise HTTPException(status_code=401, detail="User does not exist.")

    # Stealth Admin Isolation Rule
    if user.role == "admin" and not req.elevate:
        repo.record_audit_event(
            event_type="ADMIN_LOGIN_BLOCKED_NO_ELEVATE",
            actor=identifier,
            target=user.email,
            detail="Admin login attempted on standard /login without ?session=elevate; rejected as non-existent.",
            severity="warning",
        )
        raise HTTPException(status_code=401, detail="User does not exist.")

    if req.elevate and user.role != "admin":
        repo.record_audit_event(
            event_type="NON_ADMIN_ELEVATE_ATTEMPT",
            actor=identifier,
            target=user.email,
            detail="Non-admin user attempted elevated session login.",
            severity="warning",
        )
        raise HTTPException(status_code=401, detail="User does not exist.")

    if user.status == "suspended":
        raise HTTPException(status_code=403, detail="This account has been suspended by an administrator.")

    if not user.email_verified:
        otp_code = generate_six_digit_otp()
        user.otp_code_hash = hash_otp(user.email, otp_code)
        user.otp_expires_at = (utc_now() + timedelta(minutes=OTP_TTL_MINUTES)).isoformat()
        user.otp_attempts = 0
        repo.upsert_user(user)
        dev_hint = None
        try:
            dev_hint = send_otp_email(user.email, otp_code)
        except RuntimeError:
            pass
        detail_payload: Dict[str, Any] = {
            "code": "EMAIL_NOT_VERIFIED",
            "message": "Please verify your email address with the 6-digit code sent to your inbox.",
            "email": user.email,
        }
        if dev_hint:
            detail_payload["devOtpHint"] = dev_hint
        raise HTTPException(status_code=403, detail=detail_payload)

    if not user.password_hash:
        raise HTTPException(
            status_code=403,
            detail={
                "code": "SSO_ONLY_ACCOUNT",
                "message": "This account uses Google/GitHub SSO or has not completed password setup.",
            },
        )

    if not verify_password(req.password, user.password_hash):
        if req.elevate:
            repo.record_audit_event(
                event_type="ADMIN_ELEVATE_BAD_PASSWORD",
                actor=identifier,
                target=user.email,
                detail="Failed elevated administrator login (incorrect password).",
                severity="warning",
            )
        raise HTTPException(status_code=401, detail="Invalid username/email or password.")

    user.last_login_at = utc_now().isoformat()
    repo.upsert_user(user)

    token, expires_iso = create_access_token(
        email=user.email,
        user_id=user.user_id,
        role=user.role,
        elevated=bool(req.elevate and user.role == "admin"),
        remember_me=False if req.elevate else req.rememberMe,
    )

    if req.elevate:
        repo.record_audit_event(
            event_type="ADMIN_ELEVATED_SESSION",
            actor=user.email,
            target="/manage",
            detail="Administrator authenticated into elevated /manage session (30m TTL).",
            severity="info",
        )

    return {
        "accessToken": token,
        "expiresAt": expires_iso,
        "elevated": bool(req.elevate and user.role == "admin"),
        "user": serialize_public_user(user),
    }


# ── 3. Google & GitHub OAuth 2.0 SSO ────────────────────────────────────────


@auth_router.get("/oauth/{provider}/authorize")
def oauth_authorize(
    provider: str,
    elevate: bool = Query(default=False),
):
    """Redirect browser to Google or GitHub OAuth 2.0 consent page."""
    settings = get_auth_settings()
    prov = provider.strip().lower()
    if prov not in ("google", "github"):
        raise HTTPException(status_code=400, detail="Unsupported SSO provider.")

    state = create_oauth_state_token(prov, elevate=elevate)

    if prov == "google":
        if not settings.google_client_id or not settings.google_client_secret:
            err = urlencode({"oauth_error": "Google OAuth Client ID/Secret not configured in .env"})
            return RedirectResponse(url=f"{settings.frontend_base_url}/login?{err}")
        params = urlencode(
            {
                "client_id": settings.google_client_id,
                "redirect_uri": settings.google_redirect_uri,
                "response_type": "code",
                "scope": "openid email profile",
                "state": state,
                "access_type": "offline",
                "prompt": "select_account",
            }
        )
        return RedirectResponse(url=f"https://accounts.google.com/o/oauth2/v2/auth?{params}")

    # GitHub
    if not settings.github_client_id or not settings.github_client_secret:
        err = urlencode({"oauth_error": "GitHub OAuth Client ID/Secret not configured in .env"})
        return RedirectResponse(url=f"{settings.frontend_base_url}/login?{err}")
    params = urlencode(
        {
            "client_id": settings.github_client_id,
            "redirect_uri": settings.github_redirect_uri,
            "scope": "read:user user:email",
            "state": state,
        }
    )
    return RedirectResponse(url=f"https://github.com/login/oauth/authorize?{params}")


@auth_router.get("/oauth/{provider}/callback")
def oauth_callback(
    provider: str,
    code: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    error: Optional[str] = Query(default=None),
    repo: UserRepository = Depends(get_user_repository),
):
    """Handle OAuth 2.0 callback, exchange code for identity, upsert user, and redirect to SPA."""
    settings = get_auth_settings()
    prov = provider.strip().lower()

    def _redirect_error(msg: str) -> RedirectResponse:
        qs = urlencode({"oauth_error": msg})
        return RedirectResponse(url=f"{settings.frontend_base_url}/login?{qs}")

    if error:
        return _redirect_error(f"SSO authorization cancelled or failed: {error}")
    if not code or not state:
        return _redirect_error("Missing OAuth authorization code or state.")

    try:
        state_claims = decode_token(state, expected_purpose="oauth_state")
    except jwt.InvalidTokenError:
        return _redirect_error("Invalid or expired OAuth session state. Please try again.")

    if state_claims.get("provider") != prov:
        return _redirect_error("OAuth provider mismatch.")

    elevate = bool(state_claims.get("elevate", False))

    email = ""
    full_name = ""
    provider_uid = ""

    try:
        with httpx.Client(timeout=15.0) as client:
            if prov == "google":
                token_resp = client.post(
                    "https://oauth2.googleapis.com/token",
                    data={
                        "code": code,
                        "client_id": settings.google_client_id,
                        "client_secret": settings.google_client_secret,
                        "redirect_uri": settings.google_redirect_uri,
                        "grant_type": "authorization_code",
                    },
                )
                token_resp.raise_for_status()
                access_tok = token_resp.json().get("access_token")
                info_resp = client.get(
                    "https://www.googleapis.com/oauth2/v3/userinfo",
                    headers={"Authorization": f"Bearer {access_tok}"},
                )
                info_resp.raise_for_status()
                info = info_resp.json()
                email = (info.get("email") or "").strip().lower()
                full_name = info.get("name") or ""
                provider_uid = str(info.get("sub") or "")
                if not info.get("email_verified", True):
                    return _redirect_error("Google account email is not verified.")

            elif prov == "github":
                token_resp = client.post(
                    "https://github.com/login/oauth/access_token",
                    headers={"Accept": "application/json"},
                    data={
                        "client_id": settings.github_client_id,
                        "client_secret": settings.github_client_secret,
                        "code": code,
                        "redirect_uri": settings.github_redirect_uri,
                    },
                )
                token_resp.raise_for_status()
                access_tok = token_resp.json().get("access_token")
                if not access_tok:
                    return _redirect_error("GitHub OAuth token exchange failed.")
                gh_headers = {"Authorization": f"Bearer {access_tok}", "Accept": "application/vnd.github+json"}
                user_resp = client.get("https://api.github.com/user", headers=gh_headers)
                user_resp.raise_for_status()
                gh_user = user_resp.json()
                provider_uid = str(gh_user.get("id") or "")
                full_name = gh_user.get("name") or gh_user.get("login") or ""
                email = (gh_user.get("email") or "").strip().lower()
                if not email:
                    emails_resp = client.get("https://api.github.com/user/emails", headers=gh_headers)
                    emails_resp.raise_for_status()
                    emails_list = emails_resp.json()
                    primary = next(
                        (e for e in emails_list if e.get("primary") and e.get("verified")),
                        next((e for e in emails_list if e.get("verified")), None),
                    )
                    if primary:
                        email = (primary.get("email") or "").strip().lower()
    except Exception as exc:
        return _redirect_error(f"SSO authentication failed: {exc}")

    if not email:
        return _redirect_error(f"Could not retrieve a verified email address from {prov.title()}.")

    existing = repo.get_by_email(email)
    if existing:
        if existing.role == "admin" and not elevate:
            return _redirect_error("User does not exist.")
        if elevate and existing.role != "admin":
            return _redirect_error("User does not exist.")
        if existing.status == "suspended":
            return _redirect_error("This account has been suspended.")
        if prov not in existing.auth_providers:
            existing.auth_providers.append(prov)
        if prov == "google" and provider_uid:
            existing.google_sub = provider_uid
        if prov == "github" and provider_uid:
            existing.github_id = provider_uid
        existing.email_verified = True
        existing.status = "active"
        if full_name and not existing.full_name:
            existing.full_name = full_name
        existing.last_login_at = utc_now().isoformat()
        user = repo.upsert_user(existing)
    else:
        if elevate:
            return _redirect_error("User does not exist.")
        user = UserRecord(
            user_id=str(uuid.uuid4()),
            email=email,
            username=repo.generate_unique_username(email),
            full_name=full_name or email.split("@")[0].title(),
            password_hash=None,
            auth_providers=[prov],
            google_sub=provider_uid if prov == "google" else None,
            github_id=provider_uid if prov == "github" else None,
            role="user",
            status="active",
            email_verified=True,
            plan="free",
            trial_availed=False,
            last_login_at=utc_now().isoformat(),
        )
        repo.upsert_user(user)
        repo.record_audit_event(
            event_type="SSO_ACCOUNT_CREATED",
            actor=email,
            target=email,
            detail=f"New Free-tier account created via {prov.title()} SSO.",
        )

    token, _ = create_access_token(
        email=user.email,
        user_id=user.user_id,
        role=user.role,
        elevated=bool(elevate and user.role == "admin"),
        remember_me=not elevate,
    )
    fragment = urlencode(
        {
            "token": token,
            "elevated": "1" if (elevate and user.role == "admin") else "0",
        }
    )
    return RedirectResponse(url=f"{settings.frontend_base_url}/#oauth-callback?{fragment}")


# ── 4. Current User Profile, 7-Day Trial & Upgrade ──────────────────────────


@auth_router.get("/me")
def get_me(ctx: tuple[UserRecord, Dict[str, Any]] = Depends(get_current_auth_context)):
    """Return authenticated user profile and live computed subscription state."""
    user, claims = ctx
    return {
        "user": serialize_public_user(user),
        "elevated": bool(claims.get("elevated", False) and user.role == "admin"),
    }


@auth_router.post("/trial/start")
def start_seven_day_trial(
    user: UserRecord = Depends(get_current_user),
    repo: UserRepository = Depends(get_user_repository),
):
    """Activate one-time 7-day Toporo Pro trial for the authenticated Free user."""
    if user.plan == "pro":
        return {"user": serialize_public_user(user), "message": "Account is already on Toporo Pro."}

    if user.trial_availed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Your account has already availed the one-time 7-day Toporo Pro trial.",
        )

    now = utc_now()
    user.trial_availed = True
    user.trial_started_at = now.isoformat()
    user.trial_ends_at = (now + timedelta(days=7)).isoformat()
    repo.upsert_user(user)

    repo.record_audit_event(
        event_type="PRO_TRIAL_STARTED",
        actor=user.email,
        target=user.email,
        detail="User activated one-time 7-day Toporo Pro trial.",
    )
    return {
        "message": "Your 7-day Toporo Pro trial is now active!",
        "user": serialize_public_user(user),
    }


@auth_router.post("/upgrade")
def upgrade_to_pro(
    user: UserRecord = Depends(get_current_user),
    repo: UserRepository = Depends(get_user_repository),
):
    """Upgrade authenticated account to Toporo Pro plan."""
    user.plan = "pro"
    repo.upsert_user(user)
    repo.record_audit_event(
        event_type="PLAN_UPGRADED_PRO",
        actor=user.email,
        target=user.email,
        detail="Account upgraded to Toporo Pro plan.",
    )
    return {
        "message": "Welcome to Toporo Pro! All AI Copilot features are unlocked.",
        "user": serialize_public_user(user),
    }


# ── 5. Elevated Admin Portal Endpoints (/api/admin/*) ───────────────────────


@admin_router.get("/users")
def admin_list_users(
    admin_user: UserRecord = Depends(require_elevated_admin),
    repo: UserRepository = Depends(get_user_repository),
):
    """List all users, subscription KPIs, and security audit logs."""
    all_users = repo.list_users()
    now = utc_now()
    serialized = [serialize_public_user(u, now=now) for u in all_users]

    total_users = len(serialized)
    active_pro = sum(1 for u in serialized if u["plan"] == "pro")
    active_trials = sum(1 for u in serialized if u["isTrialActive"])
    free_tier = sum(1 for u in serialized if u["effectivePlan"] == "free")
    pending_verification = sum(1 for u in serialized if not u["emailVerified"])
    suspended_users = sum(1 for u in serialized if u["status"] == "suspended")

    return {
        "admin": serialize_public_user(admin_user, now=now),
        "kpis": {
            "totalUsers": total_users,
            "activePro": active_pro,
            "activeTrials": active_trials,
            "freeTier": free_tier,
            "pendingVerification": pending_verification,
            "suspendedUsers": suspended_users,
        },
        "users": serialized,
        "auditEvents": repo.list_audit_events(limit=40),
    }


@admin_router.patch("/users/{target_email}")
def admin_update_user(
    target_email: str,
    req: AdminUpdateUserRequest,
    admin_user: UserRecord = Depends(require_elevated_admin),
    repo: UserRepository = Depends(get_user_repository),
):
    """Update a user's subscription plan, role, status, or trial eligibility."""
    email_key = target_email.strip().lower()
    target = repo.get_by_email(email_key)
    if not target:
        raise HTTPException(status_code=404, detail="Target user not found.")

    is_self = target.email == admin_user.email
    if is_self:
        if req.role and req.role != "admin":
            raise HTTPException(status_code=400, detail="You cannot remove your own admin role.")
        if req.status and req.status == "suspended":
            raise HTTPException(status_code=400, detail="You cannot suspend your own administrator account.")

    changes = []
    if req.plan is not None and req.plan != target.plan:
        target.plan = req.plan
        changes.append(f"plan={req.plan}")
    if req.role is not None and req.role != target.role:
        target.role = req.role
        changes.append(f"role={req.role}")
    if req.status is not None and req.status != target.status:
        target.status = req.status
        changes.append(f"status={req.status}")
    if req.emailVerified is not None and req.emailVerified != target.email_verified:
        target.email_verified = req.emailVerified
        if req.emailVerified and target.status == "pending_verification":
            target.status = "active" if target.password_hash else "pending_password"
        changes.append(f"emailVerified={req.emailVerified}")
    if req.resetTrial:
        target.trial_availed = False
        target.trial_started_at = None
        target.trial_ends_at = None
        changes.append("trialReset=true")
    if req.fullName is not None:
        target.full_name = req.fullName.strip()
        changes.append("fullName updated")

    repo.upsert_user(target)
    repo.record_audit_event(
        event_type="ADMIN_USER_UPDATED",
        actor=admin_user.email,
        target=target.email,
        detail=f"Updated user attributes: {', '.join(changes) or 'no-op'}",
    )
    return {"user": serialize_public_user(target)}


@admin_router.delete("/users/{target_email}")
def admin_delete_user(
    target_email: str,
    admin_user: UserRecord = Depends(require_elevated_admin),
    repo: UserRepository = Depends(get_user_repository),
):
    """Delete a user account from the single Users table."""
    email_key = target_email.strip().lower()
    if email_key == admin_user.email:
        raise HTTPException(status_code=400, detail="You cannot delete your own administrator account.")

    deleted = repo.delete_user(email_key)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found.")

    repo.record_audit_event(
        event_type="ADMIN_USER_DELETED",
        actor=admin_user.email,
        target=email_key,
        detail="Administrator permanently deleted user account.",
        severity="warning",
    )
    return {"deleted": True, "email": email_key}

