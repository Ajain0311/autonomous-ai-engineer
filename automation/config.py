import os
import logging
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent.parent

# Multiple Gemini API keys — comma-separated in GEMINI_API_KEYS env var.
# Falls back to single GEMINI_API_KEY for backward compatibility.
def _parse_keys(env_var_name: str) -> list[str]:
    raw = os.environ.get(env_var_name, "")
    return [k.strip() for k in raw.split(",") if k.strip()]

GEMINI_API_KEYS = _parse_keys("GEMINI_API_KEYS") or _parse_keys("GEMINI_API_KEY")
GROQ_API_KEYS = _parse_keys("GROQ_API_KEYS") or _parse_keys("GROQ_API_KEY")
OPENROUTER_API_KEYS = _parse_keys("OPENROUTER_API_KEYS") or _parse_keys("OPENROUTER_API_KEY")
TOGETHER_API_KEYS = _parse_keys("TOGETHER_API_KEYS") or _parse_keys("TOGETHER_API_KEY")
MISTRAL_API_KEYS = _parse_keys("MISTRAL_API_KEYS") or _parse_keys("MISTRAL_API_KEY")
COHERE_API_KEYS = _parse_keys("COHERE_API_KEYS") or _parse_keys("COHERE_API_KEY")
SAMBANOVA_API_KEYS = _parse_keys("SAMBANOVA_API_KEYS") or _parse_keys("SAMBANOVA_API_KEY")
KILO_API_KEYS = _parse_keys("KILO_API_KEYS") or _parse_keys("KILO_API_KEY")
GITHUB_MODELS_KEYS = _parse_keys("GITHUB_MODELS_KEYS") or _parse_keys("GITHUB_MODELS_KEY")
HUGGINGFACE_API_KEYS = _parse_keys("HUGGINGFACE_API_KEYS") or _parse_keys("HUGGINGFACE_API_KEY") or _parse_keys("HF_API_KEY") or _parse_keys("HF_TOKEN")

GITHUB_TOKEN: str = os.environ.get("GITHUB_TOKEN", "")
GITHUB_USERNAME: str = os.environ.get("GITHUB_USERNAME", "")
NETLIFY_TOKEN: str = os.environ.get("NETLIFY_TOKEN", "")
GEMINI_MODEL: str = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

STATE_FILE = ROOT_DIR / "automation" / "state.json"
LOGS_DIR = ROOT_DIR / "automation" / "logs"


def validate() -> None:
    """Raise EnvironmentError if GITHUB_TOKEN or all API keys are missing."""
    missing = []
    has_any_key = (
        GEMINI_API_KEYS
        or GROQ_API_KEYS
        or OPENROUTER_API_KEYS
        or TOGETHER_API_KEYS
        or MISTRAL_API_KEYS
        or COHERE_API_KEYS
        or SAMBANOVA_API_KEYS
        or KILO_API_KEYS
        or GITHUB_MODELS_KEYS
        or HUGGINGFACE_API_KEYS
    )
    if not has_any_key:
        missing.append("At least one LLM API key (GEMINI_API_KEYS, GROQ_API_KEYS, OPENROUTER_API_KEYS, etc.)")
    if not GITHUB_TOKEN:
        missing.append("GITHUB_TOKEN")
    if missing:
        raise EnvironmentError(
            f"Missing required environment variables: {', '.join(missing)}"
        )
    logger.info("Loaded keys: Gemini=%d, Groq=%d, OpenRouter=%d, Together=%d, Mistral=%d, Cohere=%d, SambaNova=%d, Kilo=%d, GitHub=%d, HF=%d",
                len(GEMINI_API_KEYS), len(GROQ_API_KEYS), len(OPENROUTER_API_KEYS),
                len(TOGETHER_API_KEYS), len(MISTRAL_API_KEYS), len(COHERE_API_KEYS),
                len(SAMBANOVA_API_KEYS), len(KILO_API_KEYS), len(GITHUB_MODELS_KEYS),
                len(HUGGINGFACE_API_KEYS))

