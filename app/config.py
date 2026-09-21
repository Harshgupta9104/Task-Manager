"""Application configuration using environment variables."""

import json
import logging

from pydantic import field_validator
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)


def _normalize_origin(origin: str) -> str:
    """Normalize a single origin for consistent matching.

    - Strips surrounding whitespace
    - Removes a trailing slash so ``https://example.com/`` and
      ``https://example.com`` are treated as the same origin
    """
    origin = origin.strip()
    if origin.endswith("/"):
        origin = origin[:-1]
    return origin


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    APP_NAME: str = "Task Management API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "sqlite:///./task_manager.db"

    # CORS — default to localhost:5173 for Vite dev server.
    # Production: set this env var to the deployed frontend origin, e.g.
    #   ALLOWED_ORIGINS=https://task-manager-pi-gray.vercel.app
    # Both comma-separated and JSON-array forms are accepted, and each origin
    # is normalized (whitespace trimmed, trailing slash removed) so that a
    # trailing-slash mismatch does not break CORS in production.
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173"]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v):
        """Accept a plain string, a comma-separated string, or a JSON array.

        Every origin is normalized so that ``https://example.com/`` and
        ``https://example.com`` compare equal.
        """
        if isinstance(v, str):
            text = v.strip()
            # JSON array form: '["https://example.com"]'
            try:
                parsed = json.loads(text)
                if isinstance(parsed, list):
                    return [_normalize_origin(o) for o in parsed if isinstance(o, str)]
            except json.JSONDecodeError:
                pass
            # Comma-separated form: 'https://a.com,https://b.com'
            if "," in text:
                return [_normalize_origin(o) for o in text.split(",") if o.strip()]
            # Single origin form: 'https://example.com'
            if text:
                return [_normalize_origin(text)]
            return []
        if isinstance(v, list):
            return [_normalize_origin(o) if isinstance(o, str) else o for o in v]
        return v

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()


def _log_allowed_origins() -> None:
    """Log the normalized allowed origins at startup (no secrets).

    Done lazily here so the diagnostic is emitted once ``settings`` is
    constructed, without adding startup logic to ``app/main.py``.
    """
    try:
        logger.info(
            "CORS allowed origins: %s",
            settings.ALLOWED_ORIGINS,
        )
    except Exception:
        # Never let a config diagnostic break application startup.
        logger.exception("Failed to log CORS allowed origins")


_log_allowed_origins()
