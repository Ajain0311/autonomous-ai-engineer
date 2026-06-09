import os
import logging
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

ROOT_DIR = Path(__file__).parent.parent

GEMINI_API_KEY: str = os.environ.get("GEMINI_API_KEY", "")
GITHUB_TOKEN: str = os.environ.get("GITHUB_TOKEN", "")
GITHUB_USERNAME: str = os.environ.get("GITHUB_USERNAME", "")
NETLIFY_TOKEN: str = os.environ.get("NETLIFY_TOKEN", "")
GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

STATE_FILE = ROOT_DIR / "automation" / "state.json"
LOGS_DIR = ROOT_DIR / "automation" / "logs"


def validate() -> None:
    """Raise EnvironmentError if any required env var is missing."""
    missing = [
        name
        for name, val in [
            ("GEMINI_API_KEY", GEMINI_API_KEY),
            ("GITHUB_TOKEN", GITHUB_TOKEN),
        ]
        if not val
    ]
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}"
        )
