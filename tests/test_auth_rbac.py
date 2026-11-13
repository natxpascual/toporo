"""Automated API & RBAC tests for Toporo Auth, OTP, Stealth Admin, Trial & Pro Gating."""

from __future__ import annotations

from datetime import timedelta

import pytest
from fastapi.testclient import TestClient

from src.auth.config import get_auth_settings
from src.auth.models import utc_now
from src.auth.seed import seed_admin_account
from src.auth.user_repository import UserRepository, get_user_repository
from src.main import app


@pytest.fixture()
def auth_client(tmp_path, monkeypatch):
    """Provide an isolated TestClient backed by a temp single-table JSON store."""
    db_file = tmp_path / "test_users.json"
    monkeypatch.setenv("TOPORO_LOCAL_USERS_DB", str(db_file))
    monkeypatch.setenv("RESEND_API_KEY", "")
    monkeypatch.setenv("ADMIN_EMAIL", "admin@toporo.dev")
    monkeypatch.setenv("ADMIN_USERNAME", "admin")
    monkeypatch.setenv("ADMIN_INITIAL_PASSWORD", "Admin@Toporo2026!")
    get_auth_settings.cache_clear()

    repo = UserRepository(local_db_path=str(db_file), connection_string="")
    seed_admin_account(repo)
    app.dependency_overrides[get_user_repository] = lambda: repo

    with TestClient(app) as client:
        yield client, repo

    app.dependency_overrides.clear()
    get_auth_settings.cache_clear()


def _register_and_login_user(client: TestClient, email: str = "architect@toporo.dev", password: str = "SecurePass123!"):
    # Step 1: Email-only signup
    r1 = client.post("/api/auth/signup", json={"email": email})
    assert r1.status_code == 200, r1.text
    data1 = r1.json()
    assert data1["status"] == "otp_sent"
    otp = data1["devOtpHint"]
    assert len(otp) == 6 and otp.isdigit()

    # Step 2: Verify 6-digit OTP
    r2 = client.post("/api/auth/verify-email", json={"email": email, "otpCode": otp})
    assert r2.status_code == 200, r2.text
    data2 = r2.json()
    assert data2["status"] == "password_setup_required"
    setup_token = data2["setupToken"]

    # Step 3: Set up password
    r3 = client.post(
        "/api/auth/setup-password",
        json={"email": email, "setupToken": setup_token, "password": password},
    )
    assert r3.status_code == 200, r3.text
    return r3.json()


def test_three_step_signup_defaults_to_free_plan(auth_client):
    client, _ = auth_client
    auth_data = _register_and_login_user(client)

    user = auth_data["user"]
    assert user["email"] == "architect@toporo.dev"
    assert user["emailVerified"] is True
    assert user["plan"] == "free"
    assert user["effectivePlan"] == "free"
    assert user["trialAvailed"] is False
    assert user["shouldPromptTrial"] is True
    assert user["shouldNudgeUpgrade30m"] is False

    # Login via username or email works
    r_login = client.post(
        "/api/auth/login",
        json={"identifier": user["username"], "password": "SecurePass123!", "elevate": False},
    )
    assert r_login.status_code == 200
    assert r_login.json()["user"]["email"] == "architect@toporo.dev"


def test_otp_lockout_and_invalid_code(auth_client):
    client, _ = auth_client
    r1 = client.post("/api/auth/signup", json={"email": "otpcheck@toporo.dev"})
    assert r1.status_code == 200
    good_otp = r1.json()["devOtpHint"]
    bad_otp = "000000" if good_otp != "000000" else "999999"

    for _ in range(5):
        bad = client.post("/api/auth/verify-email", json={"email": "otpcheck@toporo.dev", "otpCode": bad_otp})
        assert bad.status_code == 400

    locked = client.post("/api/auth/verify-email", json={"email": "otpcheck@toporo.dev", "otpCode": good_otp})
    assert locked.status_code == 429


def test_one_time_trial_expiration_and_30m_nudge_flag(auth_client):
    client, repo = auth_client
    auth_data = _register_and_login_user(client, email="trialuser@toporo.dev")
    token = auth_data["accessToken"]
    headers = {"Authorization": f"Bearer {token}"}

    # Free user cannot call Copilot API
    r_copilot_free = client.post("/api/copilot/generate", json={"prompt": "3-tier web app"}, headers=headers)
    assert r_copilot_free.status_code == 403

    # Start 7-day Pro trial
    r_trial = client.post("/api/auth/trial/start", headers=headers)
    assert r_trial.status_code == 200
    trial_user = r_trial.json()["user"]
    assert trial_user["effectivePlan"] == "pro"
    assert trial_user["isTrialActive"] is True
    assert trial_user["trialAvailed"] is True
    assert trial_user["shouldPromptTrial"] is False

    # Now Copilot succeeds
    r_copilot_pro = client.post("/api/copilot/generate", json={"prompt": "3-tier web app"}, headers=headers)
    assert r_copilot_pro.status_code == 200

    # Second attempt to avail trial must fail with 409 Conflict
    r_trial_again = client.post("/api/auth/trial/start", headers=headers)
    assert r_trial_again.status_code == 409

    # Simulate trial expiration (8 days ago)
    record = repo.get_by_email("trialuser@toporo.dev")
    assert record is not None
    record.trial_started_at = (utc_now() - timedelta(days=15)).isoformat()
    record.trial_ends_at = (utc_now() - timedelta(days=8)).isoformat()
    repo.upsert_user(record)

    r_me = client.get("/api/auth/me", headers=headers)
    assert r_me.status_code == 200
    expired_user = r_me.json()["user"]
    assert expired_user["effectivePlan"] == "free"
    assert expired_user["isTrialActive"] is False
    assert expired_user["trialAvailed"] is True
    assert expired_user["shouldPromptTrial"] is False
    assert expired_user["shouldNudgeUpgrade30m"] is True

    # Copilot is locked again after trial expiration
    r_copilot_after = client.post("/api/copilot/generate", json={"prompt": "3-tier web app"}, headers=headers)
    assert r_copilot_after.status_code == 403


def test_stealth_admin_isolation_and_manage_rbac(auth_client):
    client, _ = auth_client
    reg = _register_and_login_user(client, email="normal@toporo.dev")
    normal_headers = {"Authorization": f"Bearer {reg['accessToken']}"}

    # 1. Admin logging in WITHOUT elevate=True (even with valid password) MUST return "User does not exist."
    r_admin_standard = client.post(
        "/api/auth/login",
        json={"identifier": "admin@toporo.dev", "password": "Admin@Toporo2026!", "elevate": False},
    )
    assert r_admin_standard.status_code == 401
    assert "user does not exist" in r_admin_standard.json()["detail"].lower()

    # 2. Non-admin attempting elevate=True MUST be rejected
    r_non_admin_elev = client.post(
        "/api/auth/login",
        json={"identifier": "normal@toporo.dev", "password": "SecurePass123!", "elevate": True},
    )
    assert r_non_admin_elev.status_code == 401

    # 3. Normal user cannot call /api/admin/users
    r_admin_api_denied = client.get("/api/admin/users", headers=normal_headers)
    assert r_admin_api_denied.status_code == 403

    # 4. Admin logging in WITH elevate=True succeeds and receives elevated token
    r_admin_elev = client.post(
        "/api/auth/login",
        json={"identifier": "admin", "password": "Admin@Toporo2026!", "elevate": True},
    )
    assert r_admin_elev.status_code == 200
    elev_data = r_admin_elev.json()
    assert elev_data["elevated"] is True
    admin_headers = {"Authorization": f"Bearer {elev_data['accessToken']}"}

    r_list = client.get("/api/admin/users", headers=admin_headers)
    assert r_list.status_code == 200
    payload = r_list.json()
    assert payload["kpis"]["totalUsers"] >= 2
    assert any(u["email"] == "normal@toporo.dev" for u in payload["users"])

    # 5. Admin can upgrade normal user to Pro via /api/admin/users/{email}
    r_patch = client.patch(
        "/api/admin/users/normal@toporo.dev",
        json={"plan": "pro"},
        headers=admin_headers,
    )
    assert r_patch.status_code == 200
    assert r_patch.json()["user"]["effectivePlan"] == "pro"

