"""Gemini-powered project planning and incremental code generation."""

import json
import logging
import re
import time
from typing import Any, Dict, List

from google import genai
from google.genai import errors, types

from automation import config, quota_tracker

logger = logging.getLogger(__name__)

# One client per API key — built at import time from the key list in config
_clients: list[genai.Client] = [
    genai.Client(api_key=key) for key in config.GEMINI_API_KEYS
]

_PLAN_PROMPT = """\
You are a senior software architect. Based on these trending topics, design a compelling web app.

Trending data:
{trending}

Already built (avoid duplicating these names/ideas):
{done}

Create a React + TypeScript web application that:
- Is genuinely UNIQUE: combine TWO unrelated trending themes above into one
  focused tool that does not already exist as a common tutorial app
- BANNED (too generic — never build these): todo list, weather app, notes app,
  calculator, pomodoro/timer, expense tracker, recipe finder, quiz app,
  kanban board, chat clone, portfolio template, URL shortener, password generator
- Solves one specific pain for one specific kind of user — name that user
  in the description
- Has real-world utility (not just a toy demo)
- Can be built in 10 daily increments
- Uses: React 18, TypeScript, Vite, Tailwind CSS, Zustand, React Router v6

Return ONLY valid JSON with this exact shape:
{{
  "name": "kebab-case-repo-name",
  "title": "Human Readable Title",
  "description": "2-3 sentences on what it does and why it is valuable",
  "category": "productivity|tools|data|social|education|entertainment",
  "features": ["feature 1", "feature 2", "feature 3", "feature 4"],
  "tech_stack": {{
    "framework": "React 18",
    "language": "TypeScript",
    "bundler": "Vite",
    "styling": "Tailwind CSS",
    "state": "Zustand",
    "routing": "React Router v6",
    "testing": "Vitest + React Testing Library",
    "extras": ["lucide-react", "date-fns"]
  }},
  "tasks": [
    {{
      "id": 1,
      "name": "Project scaffold",
      "description": "Vite+React+TS with Tailwind, ESLint, Prettier, Vitest, netlify.toml",
      "files": ["package.json", "vite.config.ts", "tsconfig.json", "index.html",
                "tailwind.config.js", "postcss.config.js", ".eslintrc.cjs", ".prettierrc",
                "src/main.tsx", "src/App.tsx", "src/index.css", "netlify.toml"],
      "type": "setup"
    }},
    {{
      "id": 2,
      "name": "Core layout and routing",
      "description": "Shell layout: header, sidebar/nav, React Router v6 setup, responsive",
      "files": ["src/components/Layout.tsx", "src/components/Header.tsx",
                "src/router.tsx", "src/pages/Home.tsx"],
      "type": "feature"
    }}
  ]
}}

Produce exactly 10 tasks. Each must be a meaningful, independently testable building block.
Return ONLY the JSON — no markdown fences, no commentary.
"""

_CODE_PROMPT = """\
You are a senior React developer writing production-quality TypeScript.

Project: {title}
Description: {description}
Stack: React 18, TypeScript 5, Vite, Tailwind CSS, Zustand, React Router v6, lucide-react

Task #{task_id}: {task_name}
Details: {task_desc}
Files to produce: {files}

Previously completed tasks: {done_tasks}

Rules:
- TypeScript strict mode — no `any`, no `as unknown`
- Tailwind CSS only (no inline styles)
- Semantic HTML + ARIA attributes for accessibility
- Mobile-first responsive design
- For task id=1 (setup) include ALL config files listed under "files"
- Write Vitest tests only for pure logic/utility functions
- Commit message must follow Conventional Commits (feat/fix/chore/refactor)

Return ONLY valid JSON:
{{
  "file_contents": {{
    "path/to/file.tsx": "complete file content as a string"
  }},
  "npm_packages": ["package@version"],
  "commit_message": "feat(scope): what was built"
}}

CRITICAL: every value in "file_contents" MUST be a string. For .json files,
encode the content as an escaped JSON string — never as a nested object.
"""

_FALLBACK_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.5-flash-lite",
    # Gemma models live in a separate free-tier bucket: 14,400 requests/day
    # vs ~200/day for Gemini models. They are the safety net that keeps a run
    # from ever coming home empty when every Gemini model is rate-limited.
    "gemma-3-27b-it",
    "gemma-3-12b-it",
]

_RETRY_PASS_SLEEP = 60   # pause before the single full-chain retry pass
_SERVER_ERROR_PAUSE = 3  # brief pause after a 5xx before trying the next key

_shared_project_hinted = False


class QuotaExhaustedError(RuntimeError):
    """Every key × model combination is rate-limited or unavailable."""


def _gen_config(model: str, temperature: float) -> types.GenerateContentConfig:
    """Per-model request config. Gemma rejects JSON response mode — ask for
    plain text and let _parse_json extract the JSON. Gemini 2.5 supports
    longer outputs, which avoids truncated (unparseable) code responses."""
    if model.startswith("gemma"):
        return types.GenerateContentConfig(
            temperature=temperature,
            max_output_tokens=8192,
        )
    return types.GenerateContentConfig(
        response_mime_type="application/json",
        temperature=temperature,
        max_output_tokens=16384 if model.startswith("gemini-2.5") else 8192,
    )


def _hint_shared_project() -> None:
    global _shared_project_hinted
    if _shared_project_hinted:
        return
    _shared_project_hinted = True
    logger.warning(
        "Every key hit 429 back-to-back on the same model. Free-tier quota is "
        "per Google Cloud PROJECT, not per key — keys created in the same "
        "project share one quota, so rotation adds nothing. Create each key in "
        "a separate project (aistudio.google.com → new project per key) to "
        "actually multiply quota."
    )


def _try_model(model: str, prompt: str, temperature: float):
    """
    Try every active key on one model.
    Returns (parsed_result | None, saw_rpm_style_429).
    Never raises on per-key/per-model errors — failures step to the next key.
    """
    saw_rpm = False
    active = quota_tracker.active_keys(len(_clients))
    limited = 0

    for key_idx in active:
        try:
            response = _clients[key_idx].models.generate_content(
                model=model,
                contents=prompt,
                config=_gen_config(model, temperature),
            )
            quota_tracker.mark_key_success(key_idx)
            result = _parse_json(response.text or "")
            logger.info("Gemini OK — key[%d] model=%s", key_idx, model)
            return result, saw_rpm

        except errors.ClientError as exc:
            if exc.code == 429:
                limited += 1
                logger.warning("key[%d] rate-limited (429) on %s", key_idx, model)
                quota_tracker.mark_key_rate_limited(key_idx, exc)
                if key_idx in quota_tracker.active_keys(len(_clients)):
                    saw_rpm = True  # not RPD-marked → per-minute, clears soon
            elif exc.code in (401, 403):
                logger.warning(
                    "key[%d] unauthorized (%s) — dead for this session",
                    key_idx, exc.code,
                )
                quota_tracker.mark_key_dead(key_idx)
            elif exc.code == 404:
                logger.warning(
                    "model %s not found (404) — caching as unavailable for 7 days",
                    model,
                )
                quota_tracker.mark_model_unavailable(model)
                return None, saw_rpm
            else:
                logger.warning(
                    "key[%d] client error %s on %s — skipping model",
                    key_idx, exc.code, model,
                )
                return None, saw_rpm

        except errors.ServerError as exc:
            # 500/503 — model overloaded. Transient and not the key's fault:
            # brief pause, then try the next key/model instead of crashing.
            logger.warning(
                "%s server error on key[%d] (%s) — transient, moving on",
                model, key_idx, getattr(exc, "code", "5xx"),
            )
            time.sleep(_SERVER_ERROR_PAUSE)

        except ValueError as exc:
            logger.warning(
                "key[%d] %s response unparseable (%s) — trying next key",
                key_idx, model, str(exc)[:120],
            )

        except Exception as exc:
            logger.warning(
                "key[%d] unexpected error on %s: %s — trying next key",
                key_idx, model, exc,
            )

    if len(active) >= 2 and limited == len(active):
        _hint_shared_project()
    return None, saw_rpm


def _call_gemini(prompt: str, temperature: float) -> Dict[str, Any]:
    """
    Rotate through every available model × key combination.

    - quota_tracker.available_models(): skips 404-cached models (persisted 7d)
    - quota_tracker.active_keys(): skips RPD-exhausted and dead keys; LRU-orders
      remaining keys so quota load is spread evenly
    - Different models have separate rate buckets, so a 429 on one model says
      nothing about the next — move on immediately, no sleep between models.
    - One full retry pass after _RETRY_PASS_SLEEP when at least one 429 looked
      per-minute (RPM) rather than per-day (RPD).
    - 5xx (model overloaded) and unparseable responses step to the next
      key/model instead of crashing the run.
    """
    if not _clients:
        raise RuntimeError("No Gemini API keys configured.")

    primary = config.GEMINI_MODEL
    all_models = [primary] + [m for m in _FALLBACK_MODELS if m != primary]

    for attempt in (1, 2):
        models = quota_tracker.available_models(all_models)
        if not models:
            raise QuotaExhaustedError(
                "No models available — all are 404-cached as unavailable. "
                "Check model names or wait for quota_tracker to re-check in 7 days."
            )
        if quota_tracker.all_rpd_exhausted(len(_clients)):
            raise QuotaExhaustedError(
                "All API keys have hit today's daily quota (RPD). "
                "Quota resets at midnight UTC."
            )

        skipped = len(all_models) - len(models)
        if skipped:
            logger.info("Skipping %d 404-cached model(s) from quota state", skipped)

        saw_rpm = False
        for model in models:
            result, rpm = _try_model(model, prompt, temperature)
            if result is not None:
                return result
            saw_rpm = saw_rpm or rpm
            if not quota_tracker.active_keys(len(_clients)):
                break

        if (
            attempt == 1
            and saw_rpm
            and quota_tracker.active_keys(len(_clients))
        ):
            logger.warning(
                "All models failed but some 429s look per-minute — sleeping %ds, "
                "then one full retry pass", _RETRY_PASS_SLEEP,
            )
            time.sleep(_RETRY_PASS_SLEEP)
            continue
        break

    total = len(_clients)
    raise QuotaExhaustedError(
        f"All {total} API key(s) × {len(all_models)} model(s) exhausted. "
        "If every key 429s instantly, the keys probably share ONE Google Cloud "
        "project (free-tier quota is per-project, not per-key) — create each "
        "key in its own project to actually multiply quota."
    )


def _parse_json(text: str) -> Dict[str, Any]:
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"Cannot parse JSON from response: {text[:300]}")


def plan_new_project(trending: Dict, completed_names: List[str]) -> Dict[str, Any]:
    """Use Gemini to design a new project based on trending topics."""
    prompt = _PLAN_PROMPT.format(
        trending=json.dumps(trending, indent=2),
        done=json.dumps(completed_names),
    )
    plan = _call_gemini(prompt, temperature=0.9)
    logger.info("Planned project: %s (%s)", plan.get("name"), plan.get("title"))
    return plan


def generate_task_code(
    project: Dict, task: Dict, done_tasks: List[Dict]
) -> Dict[str, Any]:
    """Use Gemini to generate code files for a single task."""
    prompt = _CODE_PROMPT.format(
        title=project["title"],
        description=project["description"],
        task_id=task["id"],
        task_name=task["name"],
        task_desc=task["description"],
        files=json.dumps(task.get("files", [])),
        done_tasks=json.dumps([t["name"] for t in done_tasks]),
    )
    result = _call_gemini(prompt, temperature=0.2)

    # Gemini sometimes returns .json file contents as nested objects instead
    # of strings — GitHub blob creation requires strings, so coerce here.
    files = result.get("file_contents")
    if isinstance(files, dict):
        result["file_contents"] = {
            path: content if isinstance(content, str)
            else json.dumps(content, indent=2)
            for path, content in files.items()
        }

    file_count = len(result.get("file_contents", {}))
    logger.info("Generated %d file(s) for task: %s", file_count, task["name"])
    return result
