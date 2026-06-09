"""Gemini-powered project planning and incremental code generation."""

import json
import logging
import re
import time
from typing import Any, Dict, List

from google import genai
from google.genai import errors, types

from automation import config

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=config.GEMINI_API_KEY)

_PLAN_PROMPT = """\
You are a senior software architect. Based on these trending topics, design a compelling web app.

Trending data:
{trending}

Already built (avoid duplicating these names/ideas):
{done}

Create a React + TypeScript web application that:
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

Return ONLY the JSON — no markdown fences, no commentary.
"""


_FALLBACK_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
]

# Seconds to wait after each consecutive 429, per model
_BACKOFF = [90, 120]


def _call_gemini(prompt: str, temperature: float) -> Dict[str, Any]:
    """Call Gemini with exponential backoff across multiple model fallbacks."""
    # Build model list: configured model first, then the rest (deduped)
    primary = config.GEMINI_MODEL
    models = [primary] + [m for m in _FALLBACK_MODELS if m != primary]

    for model in models:
        for attempt, wait in enumerate(_BACKOFF, start=1):
            try:
                response = _client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json",
                        temperature=temperature,
                        max_output_tokens=8192,
                    ),
                )
                logger.info("Gemini OK (model=%s attempt=%d)", model, attempt)
                return _parse_json(response.text)

            except errors.ClientError as exc:
                if exc.code == 429:
                    logger.warning(
                        "Rate limited on %s (attempt %d) — waiting %ds",
                        model, attempt, wait,
                    )
                    time.sleep(wait)
                else:
                    logger.warning(
                        "Gemini %s error %s — skipping to next model",
                        model, exc.code,
                    )
                    break  # non-429 error: skip to next model immediately
            except Exception as exc:
                logger.error("Unexpected Gemini error on %s: %s", model, exc)
                raise
        else:
            # Exhausted all retries for this model
            logger.warning("All retries exhausted for %s — trying next model", model)

    raise RuntimeError(
        "All Gemini models rate-limited or unavailable. "
        "Free-tier quota may be exhausted for today."
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
    plan = _call_gemini(prompt, temperature=0.8)
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
    file_count = len(result.get("file_contents", {}))
    logger.info("Generated %d file(s) for task: %s", file_count, task["name"])
    return result
