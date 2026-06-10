"""
Test every key in GEMINI_API_KEYS, remove any that return 401/403,
then write the filtered list back to the repo secret via gh CLI.
"""

import os
import subprocess
import sys

from google import genai
from google.genai import errors, types

_TEST_MODELS = ["gemini-2.0-flash", "gemini-2.0-flash-lite"]
_TEST_PROMPT = "Reply with the single word: ok"


def _is_key_valid(key: str, index: int) -> bool:
    """
    Returns True if the key is valid (or just rate-limited).
    Returns False only if the key is unauthorized (401/403).
    """
    client = genai.Client(api_key=key)
    for model in _TEST_MODELS:
        try:
            client.models.generate_content(
                model=model,
                contents=_TEST_PROMPT,
                config=types.GenerateContentConfig(max_output_tokens=5),
            )
            print(f"  key[{index}]: VALID ({model} responded OK)")
            return True
        except errors.ClientError as exc:
            if exc.code in (401, 403):
                print(f"  key[{index}]: INVALID — {exc.code} Unauthorized (removing)")
                return False
            if exc.code == 429:
                print(f"  key[{index}]: rate-limited on {model} — trying next model")
                continue
            if exc.code == 404:
                print(f"  key[{index}]: {model} not found — trying next model")
                continue
            print(f"  key[{index}]: unexpected {exc.code} on {model} — keeping key")
            return True
        except Exception as exc:
            print(f"  key[{index}]: unexpected error ({exc}) — keeping key")
            return True

    # All test models were rate-limited or 404 — key may be valid, keep it
    print(f"  key[{index}]: could not confirm (all models rate-limited/unavailable) — keeping")
    return True


def main() -> None:
    raw = os.environ.get("GEMINI_API_KEYS", "").strip()
    if not raw:
        print("ERROR: GEMINI_API_KEYS environment variable is not set.")
        sys.exit(1)

    keys = [k.strip() for k in raw.split(",") if k.strip()]
    print(f"Testing {len(keys)} API key(s)...")

    valid_keys = [k for i, k in enumerate(keys) if _is_key_valid(k, i)]

    removed = len(keys) - len(valid_keys)
    print(f"\n{len(valid_keys)}/{len(keys)} key(s) are valid ({removed} removed).")

    if removed == 0:
        print("No changes needed — all keys are valid.")
        return

    new_value = ",".join(valid_keys)
    repo = os.environ.get("GITHUB_REPOSITORY", "")
    if not repo:
        print("ERROR: GITHUB_REPOSITORY is not set.")
        sys.exit(1)

    result = subprocess.run(
        ["gh", "secret", "set", "GEMINI_API_KEYS", "--body", new_value, "--repo", repo],
        capture_output=True,
        text=True,
    )
    if result.returncode == 0:
        print(f"GEMINI_API_KEYS updated — {len(valid_keys)} valid key(s) retained.")
    else:
        print(f"Failed to update secret:\n{result.stderr}")
        sys.exit(1)


if __name__ == "__main__":
    main()
