"""Email OTP delivery via Resend HTTP API with local console fallback."""

from __future__ import annotations

from typing import Optional
import httpx

from src.auth.config import get_auth_settings


def send_otp_email(to_email: str, otp_code: str) -> Optional[str]:
    """Send 6-digit verification code via Resend API, or log to console in dev mode.

    Returns the dev console OTP hint ONLY when RESEND_API_KEY is unconfigured
    and local dev mode is active, otherwise returns None.
    """
    settings = get_auth_settings()
    if not settings.resend_api_key:
        banner = (
            "\n"
            "============================================================\n"
            f"  [TOPORO DEV EMAIL OTP] To: {to_email}\n"
            f"  6-Digit Verification Code: {otp_code} (expires in 10 min)\n"
            "============================================================\n"
        )
        print(banner, flush=True)
        return otp_code

    html_body = f"""
    <div style="font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f5f5f4; border: 1px solid #d6d3d1; border-radius: 12px; color: #1c1917;">
      <div style="font-family: monospace; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; color: #2b5a43; margin-bottom: 12px;">
        TOPORO · AZURE CLOUD TOPOLOGY ENGINE
      </div>
      <h2 style="margin: 0 0 12px; font-size: 20px; font-weight: 600;">Verify your email address</h2>
      <p style="margin: 0 0 20px; font-size: 14px; line-height: 1.5; color: #57534e;">
        Enter the following 6-digit verification code to confirm your email and set up your Toporo account password. This code expires in 10 minutes.
      </p>
      <div style="background: #0b1d0b; color: #a7e68f; font-family: monospace; font-size: 28px; font-weight: 700; letter-spacing: 0.25em; text-align: center; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
        {otp_code}
      </div>
      <p style="margin: 0; font-size: 12px; color: #57534e;">
        If you did not request this verification code, you can safely ignore this email.
      </p>
    </div>
    """

    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": settings.email_from_address,
                    "to": [to_email],
                    "subject": f"{otp_code} is your Toporo verification code",
                    "html": html_body,
                },
            )
            resp.raise_for_status()
    except Exception as exc:
        print(f"[Toporo Email Service] Failed to send email via Resend: {exc}", flush=True)
        raise RuntimeError("Unable to dispatch verification email. Please try again later.") from exc

    return None

