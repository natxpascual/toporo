"""Single-table User Repository backed by Azure Table Storage with local JSON fallback."""

from __future__ import annotations

import json
import threading
import uuid
from pathlib import Path
from typing import Any, Dict, List, Optional

from src.auth.config import get_auth_settings
from src.auth.models import UserRecord, utc_now

USER_PARTITION_KEY = "USER"
AUDIT_PARTITION_KEY = "AUDIT"


class UserRepository:
    """Single-table persistence for Toporo user accounts and security audit events.

    Uses Azure Table Storage (`ToporoUsers`) when `AZURE_STORAGE_CONNECTION_STRING`
    is configured, and falls back to an atomic local JSON file in dev/test mode.
    """

    def __init__(self, local_db_path: Optional[str] = None, connection_string: Optional[str] = None) -> None:
        settings = get_auth_settings()
        self._lock = threading.RLock()
        self._conn_str = (
            connection_string if connection_string is not None else settings.azure_storage_connection_string
        )
        self._table_name = settings.azure_users_table_name
        self._local_path = Path(local_db_path or settings.local_db_path)
        self._table_client = None

        if self._conn_str:
            try:
                from azure.data.tables import TableServiceClient

                service = TableServiceClient.from_connection_string(self._conn_str)
                service.create_table_if_not_exists(self._table_name)
                self._table_client = service.get_table_client(self._table_name)
            except Exception as exc:
                # Never silently lose persistence; fall back only with warning if Azure init fails
                print(f"[Toporo Auth] Warning: Azure Table init failed ({exc}); using local JSON store.")
                self._table_client = None

        if self._table_client is None:
            self._ensure_local_store()

    # ── Local JSON Store Helpers ────────────────────────────────────────────

    def _ensure_local_store(self) -> None:
        self._local_path.parent.mkdir(parents=True, exist_ok=True)
        if not self._local_path.exists():
            self._write_local_data({"users": {}, "audits": []})

    def _read_local_data(self) -> Dict[str, Any]:
        self._ensure_local_store()
        with self._local_path.open("r", encoding="utf-8") as fh:
            return json.load(fh)

    def _write_local_data(self, data: Dict[str, Any]) -> None:
        self._local_path.parent.mkdir(parents=True, exist_ok=True)
        tmp_path = self._local_path.with_suffix(".tmp")
        with tmp_path.open("w", encoding="utf-8") as fh:
            json.dump(data, fh, indent=2)
        tmp_path.replace(self._local_path)

    # ── Azure Table Serialization Helpers ───────────────────────────────────

    @staticmethod
    def _to_azure_entity(user: UserRecord) -> Dict[str, Any]:
        return {
            "PartitionKey": USER_PARTITION_KEY,
            "RowKey": user.email.strip().lower(),
            "user_id": user.user_id,
            "email": user.email.strip().lower(),
            "username": user.username.strip().lower(),
            "full_name": user.full_name,
            "password_hash": user.password_hash or "",
            "auth_providers": json.dumps(user.auth_providers),
            "google_sub": user.google_sub or "",
            "github_id": user.github_id or "",
            "role": user.role,
            "status": user.status,
            "email_verified": bool(user.email_verified),
            "otp_code_hash": user.otp_code_hash or "",
            "otp_expires_at": user.otp_expires_at or "",
            "otp_attempts": int(user.otp_attempts),
            "plan": user.plan,
            "trial_availed": bool(user.trial_availed),
            "trial_started_at": user.trial_started_at or "",
            "trial_ends_at": user.trial_ends_at or "",
            "created_at": user.created_at,
            "last_login_at": user.last_login_at or "",
        }

    @staticmethod
    def _from_azure_entity(entity: Dict[str, Any]) -> UserRecord:
        providers_raw = entity.get("auth_providers", '["local"]')
        try:
            providers = json.loads(providers_raw) if isinstance(providers_raw, str) else list(providers_raw)
        except Exception:
            providers = ["local"]

        return UserRecord(
            user_id=entity["user_id"],
            email=entity["email"],
            username=entity["username"],
            full_name=entity.get("full_name", ""),
            password_hash=entity.get("password_hash") or None,
            auth_providers=providers,
            google_sub=entity.get("google_sub") or None,
            github_id=entity.get("github_id") or None,
            role=entity.get("role", "user"),
            status=entity.get("status", "pending_verification"),
            email_verified=bool(entity.get("email_verified", False)),
            otp_code_hash=entity.get("otp_code_hash") or None,
            otp_expires_at=entity.get("otp_expires_at") or None,
            otp_attempts=int(entity.get("otp_attempts", 0)),
            plan=entity.get("plan", "free"),
            trial_availed=bool(entity.get("trial_availed", False)),
            trial_started_at=entity.get("trial_started_at") or None,
            trial_ends_at=entity.get("trial_ends_at") or None,
            created_at=entity.get("created_at", utc_now().isoformat()),
            last_login_at=entity.get("last_login_at") or None,
        )

    # ── CRUD Operations ─────────────────────────────────────────────────────

    def get_by_email(self, email: str) -> Optional[UserRecord]:
        key = email.strip().lower()
        with self._lock:
            if self._table_client is not None:
                try:
                    entity = self._table_client.get_entity(partition_key=USER_PARTITION_KEY, row_key=key)
                    return self._from_azure_entity(entity)
                except Exception:
                    return None
            data = self._read_local_data()
            raw = data["users"].get(key)
            return UserRecord(**raw) if raw else None

    def get_by_username(self, username: str) -> Optional[UserRecord]:
        target = username.strip().lower()
        with self._lock:
            for user in self.list_users():
                if user.username.strip().lower() == target:
                    return user
            return None

    def get_by_identifier(self, identifier: str) -> Optional[UserRecord]:
        """Look up user by normalized email or username."""
        cleaned = identifier.strip().lower()
        user = self.get_by_email(cleaned)
        if user:
            return user
        return self.get_by_username(cleaned)

    def upsert_user(self, user: UserRecord) -> UserRecord:
        normalized_email = user.email.strip().lower()
        user.email = normalized_email
        user.username = user.username.strip().lower()
        with self._lock:
            if self._table_client is not None:
                from azure.data.tables import UpdateMode

                entity = self._to_azure_entity(user)
                self._table_client.upsert_entity(mode=UpdateMode.REPLACE, entity=entity)
                return user
            data = self._read_local_data()
            data["users"][normalized_email] = user.model_dump()
            self._write_local_data(data)
            return user

    def delete_user(self, email: str) -> bool:
        key = email.strip().lower()
        with self._lock:
            if self._table_client is not None:
                try:
                    self._table_client.delete_entity(partition_key=USER_PARTITION_KEY, row_key=key)
                    return True
                except Exception:
                    return False
            data = self._read_local_data()
            if key in data["users"]:
                del data["users"][key]
                self._write_local_data(data)
                return True
            return False

    def list_users(self) -> List[UserRecord]:
        with self._lock:
            if self._table_client is not None:
                entities = self._table_client.query_entities(
                    query_filter=f"PartitionKey eq '{USER_PARTITION_KEY}'"
                )
                users = [self._from_azure_entity(e) for e in entities]
                return sorted(users, key=lambda u: u.created_at, reverse=True)
            data = self._read_local_data()
            users = [UserRecord(**u) for u in data["users"].values()]
            return sorted(users, key=lambda u: u.created_at, reverse=True)

    def generate_unique_username(self, email: str, preferred: Optional[str] = None) -> str:
        """Derive a clean, unique username handle from email prefix or preferred name."""
        base = (preferred or email.split("@")[0]).strip().lower()
        sanitized = "".join(ch for ch in base if ch.isalnum() or ch in ("_", "-", ".")) or "architect"
        candidate = sanitized[:24]
        if not self.get_by_username(candidate):
            return candidate
        for idx in range(1, 500):
            numbered = f"{candidate[:18]}{idx}"
            if not self.get_by_username(numbered):
                return numbered
        return f"{candidate[:14]}_{uuid.uuid4().hex[:6]}"

    # ── Security Audit Trail (Same Single Table under AUDIT partition) ──────

    def record_audit_event(
        self,
        *,
        event_type: str,
        actor: str,
        target: str = "",
        detail: str = "",
        severity: str = "info",
    ) -> None:
        timestamp = utc_now().isoformat()
        event_id = f"{timestamp}_{uuid.uuid4().hex[:8]}"
        entry = {
            "id": event_id,
            "timestamp": timestamp,
            "eventType": event_type,
            "actor": actor,
            "target": target,
            "detail": detail,
            "severity": severity,
        }
        with self._lock:
            if self._table_client is not None:
                try:
                    self._table_client.upsert_entity(
                        entity={
                            "PartitionKey": AUDIT_PARTITION_KEY,
                            "RowKey": event_id.replace(":", "-"),
                            **entry,
                        }
                    )
                    return
                except Exception:
                    pass
            data = self._read_local_data()
            audits = data.setdefault("audits", [])
            audits.insert(0, entry)
            data["audits"] = audits[:100]
            self._write_local_data(data)

    def list_audit_events(self, limit: int = 30) -> List[Dict[str, Any]]:
        with self._lock:
            if self._table_client is not None:
                try:
                    entities = self._table_client.query_entities(
                        query_filter=f"PartitionKey eq '{AUDIT_PARTITION_KEY}'"
                    )
                    events = [
                        {
                            "id": e.get("id", ""),
                            "timestamp": e.get("timestamp", ""),
                            "eventType": e.get("eventType", ""),
                            "actor": e.get("actor", ""),
                            "target": e.get("target", ""),
                            "detail": e.get("detail", ""),
                            "severity": e.get("severity", "info"),
                        }
                        for e in entities
                    ]
                    events.sort(key=lambda item: item["timestamp"], reverse=True)
                    return events[:limit]
                except Exception:
                    return []
            data = self._read_local_data()
            return list(data.get("audits", []))[:limit]


_default_repo: Optional[UserRepository] = None


def get_user_repository() -> UserRepository:
    """Return singleton UserRepository instance."""
    global _default_repo
    if _default_repo is None:
        _default_repo = UserRepository()
    return _default_repo

