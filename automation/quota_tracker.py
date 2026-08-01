"""
Cross-run API quota state management.

Persisted in state.json["quota"] so each run learns from the previous one.

Key ideas:
  - 404 models are cached for MODEL_RECHECK_DAYS — never wasted again.
  - RPD (daily) quota is detected from the error message, or inferred when
    the same key fails with 429 on RPD_CONFIRM_MODELS+ models in one run
    (after sleeping between models, RPM should have cleared; if the key is
    still 429, it's daily exhaustion).
  - Dead keys (401/403) are session-only — they reset on process restart.
    The fix-api-keys workflow handles permanent removal.
  - Keys are sorted least-recently-used first to distribute quota load.
"""

import logging
from datetime import datetime, timezone
from typing import Dict, List, Set

logger = logging.getLogger(__name__)
_UTC = timezone.utc

_MODEL_RECHECK_DAYS = 7   # days before retrying a 404-cached model
_RPD_CONFIRM_MODELS = 3   # key failing with ambiguous 429 on this many models → assume RPD

# Session-only state (reset on process restart)
_dead_keys: Set[int] = set()
_model_fail_count: Dict[int, int] = {}  # key_idx → 429 count across models this run

# Persisted in state.json["quota"]
_rpd_exhausted: Dict[int, str] = {}      # key_idx → "YYYY-MM-DD" of exhaustion
_model_unavailable: Dict[str, str] = {}  # model name → ISO timestamp of 404
_key_last_used: Dict[int, str] = {}      # key_idx → ISO timestamp of last success


def load(quota_dict: dict) -> None:
    global _rpd_exhausted, _model_unavailable, _key_last_used
    _rpd_exhausted = {int(k): v for k, v in quota_dict.get("rpd_exhausted", {}).items()}
    _model_unavailable = dict(quota_dict.get("model_unavailable", {}))
    _key_last_used = {int(k): v for k, v in quota_dict.get("key_last_used", {}).items()}

    today = _today()
    skipped_keys = [k for k, d in _rpd_exhausted.items() if d == today]
    skipped_models = [m for m in _model_unavailable if not _model_ok(m)]
    if skipped_keys:
        logger.info("quota: key(s) %s skipped — RPD-exhausted today", list(skipped_keys))
    if skipped_models:
        logger.info("quota: model(s) %s skipped — 404-cached", skipped_models)


def save() -> dict:
    return {
        "rpd_exhausted": {str(k): v for k, v in _rpd_exhausted.items()},
        "model_unavailable": dict(_model_unavailable),
        "key_last_used": {str(k): v for k, v in _key_last_used.items()},
    }


def active_keys(total: int) -> List[int]:
    """
    Keys available to use this run:
    - not dead (401/403 this session)
    - not RPD-exhausted today
    Sorted least-recently-used first to distribute quota load evenly.
    """
    today = _today()
    eligible = [
        i for i in range(total)
        if i not in _dead_keys and _rpd_exhausted.get(i) != today
    ]
    eligible.sort(key=lambda i: _key_last_used.get(i, ""))
    return eligible


def all_rpd_exhausted(total: int) -> bool:
    """True when every non-dead key has hit daily quota today."""
    if total == 0:
        return False
    today = _today()
    for i in range(total):
        if i not in _dead_keys and _rpd_exhausted.get(i) != today:
            return False
    return True


def available_models(candidates: List[str]) -> List[str]:
    """Filter out models permanently cached as 404."""
    return [m for m in candidates if _model_ok(m)]


def mark_key_dead(key_idx: int) -> None:
    _dead_keys.add(key_idx)


def mark_key_rate_limited(key_idx: int, exc) -> None:
    """
    Called on any 429. First tries to detect RPD vs RPM from the error message
    (Google includes the quota limit name, e.g. 'PerDayPerProject').
    Explicit per-minute limits are NOT counted toward the RPD inference — model
    attempts are back-to-back now, so an RPM-limited key would otherwise rack
    up 429s across models in seconds and be wrongly benched for the day.
    Only ambiguous 429s feed the model-count heuristic.
    """
    if _looks_like_rpd(exc):
        logger.warning("key[%d] daily quota (RPD) detected from error message", key_idx)
        _rpd_exhausted[key_idx] = _today()
        return

    if _looks_like_rpm(exc):
        return  # per-minute — clears on its own within ~60s

    count = _model_fail_count.get(key_idx, 0) + 1
    _model_fail_count[key_idx] = count
    if count >= _RPD_CONFIRM_MODELS:
        logger.warning(
            "key[%d] ambiguous 429 on %d+ models this run — inferring RPD exhaustion",
            key_idx, count,
        )
        _rpd_exhausted[key_idx] = _today()


def mark_key_success(key_idx: int) -> None:
    _key_last_used[key_idx] = datetime.now(_UTC).isoformat()


def mark_model_unavailable(model: str) -> None:
    _model_unavailable[model] = datetime.now(_UTC).isoformat()


def _today() -> str:
    return datetime.now(_UTC).strftime("%Y-%m-%d")


def _model_ok(model: str) -> bool:
    ts = _model_unavailable.get(model)
    if not ts:
        return True
    return (datetime.now(_UTC) - datetime.fromisoformat(ts)).days >= _MODEL_RECHECK_DAYS


def _looks_like_rpd(exc) -> bool:
    """
    Google's 429 error message contains the limit name or quota error, e.g.:
      "GenerateRequestsPerDayPerProjectPerModel"  → RPD
      "You exceeded your current quota, please check your plan and billing details." -> Daily/billing exhausted
    """
    msg = f"{getattr(exc, 'message', '') or ''} {str(exc)}".lower()
    return (
        "per_day" in msg or 
        "perday" in msg or 
        "_day_" in msg or 
        "exceeded your current quota" in msg or 
        "billing" in msg
    )


def _looks_like_rpm(exc) -> bool:
    """True when the 429 message explicitly names a per-minute quota."""
    msg = f"{getattr(exc, 'message', '') or ''} {str(exc)}".lower()
    return "per_minute" in msg or "perminute" in msg or "_minute_" in msg or "queries per minute" in msg
