import os
import logging
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent.parent

# Multiple Gemini API keys — comma-separated in GEMINI_API_KEYS env var.
# Falls back to single GEMINI_API_KEY for backward compatibility.
_raw_keys = os.environ.get("GEMINI_API_KEYS", "") or os.environ.get("GEMINI_API_KEY", "")
GEMINI_API_KEYS: list[str] = [k.strip() for k in _raw_keys.split(",") if k.strip()]

GITHUB_TOKEN: str = os.environ.get("GITHUB_TOKEN", "")
GITHUB_USERNAME: str = os.environ.get("GITHUB_USERNAME", "")
NETLIFY_TOKEN: str = os.environ.get("NETLIFY_TOKEN", "")
GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

STATE_FILE = ROOT_DIR / "automation" / "state.json"
LOGS_DIR = ROOT_DIR / "automation" / "logs"


def validate() -> None:
    """Raise EnvironmentError if any required env var is missing."""
    missing = []
    if not GEMINI_API_KEYS:
        missing.append("GEMINI_API_KEYS (or GEMINI_API_KEY)")
    if not GITHUB_TOKEN:
        missing.append("GITHUB_TOKEN")
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}"
        )
    logger.info("Loaded %d Gemini API key(s)", len(GEMINI_API_KEYS))
    if len(GEMINI_API_KEYS) < 2:
        logger.warning(
            "Only 1 Gemini API key configured — consider adding more keys "
            "to GEMINI_API_KEYS for better quota coverage across 4 daily runs."
        )
