"""
Daily automation entry point.

Runs TASKS_PER_RUN times per invocation (default 1).
The workflow calls this 4× per day → up to 4 commits/day spread across IST hours.

Flow per iteration:
  1. Load state.json (includes quota state and today's trend cache)
  2. Early-exit if all API keys are RPD-exhausted today
  3. If no active project (or all tasks done) → plan new project via Gemini
  4. Create GitHub repo + Netlify site for new projects
  5. Generate code for the next pending task with Gemini
  6. Commit files to the project repo
  7. Persist updated state.json (always includes latest quota state)
"""

import logging
import os
import sys
from datetime import datetime, timezone

from automation import config, quota_tracker
from automation.trend_finder import get_trending_topics
from automation.project_planner import plan_new_project, generate_task_code
from automation.github_manager import GitHubManager
from automation.netlify_manager import NetlifyManager
from automation.progress_tracker import (
    load_state,
    save_state,
    get_current_project,
    get_next_task,
    get_completed_tasks,
    mark_task_done,
    set_new_project,
    complete_current_project,
    is_project_complete,
    get_completed_project_names,
)

_UTC = timezone.utc


def _setup_logging() -> None:
    config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(_UTC).strftime("%Y%m%d_%H%M%S")
    log_file = config.LOGS_DIR / f"run_{stamp}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file),
        ],
    )


def _save_state(state: dict) -> None:
    """Save state, always including the latest quota snapshot."""
    state["quota"] = quota_tracker.save()
    save_state(state)


def _write_summary(text: str) -> None:
    """Surface run outcome in the GitHub Actions job summary (no-op locally)."""
    path = os.environ.get("GITHUB_STEP_SUMMARY")
    if not path:
        return
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"### Daily Code Generation\n\n{text}\n")


def _get_trending(state: dict) -> dict:
    """
    Return today's trending topics, using a same-day cache when available.
    Saves ~26 HTTP requests on repeated calls within the same UTC day.
    """
    today = datetime.now(_UTC).strftime("%Y-%m-%d")
    cache = state.get("trending_cache", {})
    if cache.get("date") == today and cache.get("data"):
        logging.getLogger(__name__).info(
            "Reusing today's trending data (cached at %s)", cache.get("fetched_at", "?")
        )
        return cache["data"]
    data = get_trending_topics()
    state["trending_cache"] = {
        "date": today,
        "fetched_at": datetime.now(_UTC).isoformat(),
        "data": data,
    }
    return data


def _start_new_project(state: dict, github: GitHubManager) -> dict:
    logger = logging.getLogger(__name__)

    trending = _get_trending(state)

    logger.info("Planning new project with Gemini…")
    try:
        plan = plan_new_project(trending, get_completed_project_names(state))
    except RuntimeError as exc:
        logger.error("Cannot plan new project — Gemini unavailable: %s", exc)
        return state

    state = set_new_project(state, plan)
    project = get_current_project(state)

    logger.info("Creating GitHub repo: %s", project["name"])
    project["github_url"] = github.create_repo(project["name"], project["description"])

    if config.NETLIFY_TOKEN:
        netlify = NetlifyManager()
        try:
            info = netlify.create_site_from_repo(
                project["name"], project["name"], github.username
            )
            project["netlify_site_id"] = info["site_id"]
            project["netlify_url"] = info["url"]
            logger.info("Netlify site: %s", info["url"])
        except Exception as exc:
            logger.warning("Netlify setup skipped: %s", exc)

    _save_state(state)
    return state


def _run_one_task(state: dict, github: GitHubManager, logger: logging.Logger) -> dict:
    """Generate and commit code for the next pending task. Returns updated state."""
    project = get_current_project(state)

    # Archive a fully-complete project, then start fresh
    if is_project_complete(state):
        if project:
            logger.info("Project '%s' is fully complete — archiving.", project["name"])
            if config.NETLIFY_TOKEN and project.get("netlify_site_id"):
                try:
                    deploy = NetlifyManager().get_deploy_status(project["netlify_site_id"])
                    if deploy["state"] == "ready":
                        state = complete_current_project(
                            state, deploy["url"], project.get("github_url", "")
                        )
                        _save_state(state)
                except Exception as exc:
                    logger.warning("Could not check Netlify deploy: %s", exc)
        state = _start_new_project(state, github)

    project = get_current_project(state)
    task = get_next_task(state)

    if not task:
        logger.info("No pending tasks — nothing to commit this iteration.")
        return state

    total = len(project["tasks"])
    done_count = sum(1 for t in project["tasks"] if t.get("status") == "done")
    logger.info(
        "Task [%d/%d]: %s  (project: %s)",
        done_count + 1, total, task["name"], project["name"],
    )

    logger.info("Generating code with Gemini…")
    try:
        impl = generate_task_code(project, task, get_completed_tasks(state))
    except RuntimeError as exc:
        logger.error("Gemini unavailable — skipping task this run: %s", exc)
        return state

    files: dict = impl.get("file_contents", {})
    commit_msg: str = impl.get("commit_message") or f"feat: {task['name']}"

    if not files:
        logger.warning("Gemini returned no files — skipping commit.")
        return state

    logger.info("Committing %d file(s) → %s", len(files), project["name"])
    sha = github.commit_files(
        repo_name=project["name"],
        files=files,
        message=commit_msg,
    )

    state = mark_task_done(state, task["id"], sha)
    _save_state(state)

    remaining = sum(1 for t in project["tasks"] if t.get("status") == "pending")
    logger.info("Commit %s done | %d task(s) remaining", sha[:7], remaining)
    return state


def run() -> None:
    _setup_logging()
    logger = logging.getLogger(__name__)

    tasks_per_run = int(os.environ.get("TASKS_PER_RUN", "1"))
    now = datetime.now(_UTC)
    logger.info(
        "=== Daily Code Automation — %s UTC | tasks_per_run=%d ===",
        now.strftime("%Y-%m-%d %H:%M"),
        tasks_per_run,
    )

    config.validate()
    state = load_state()
    quota_tracker.load(state.get("quota", {}))

    # Skip entire run when every non-dead key has hit daily quota today.
    # Saves all the API calls that would just return 429 anyway.
    if quota_tracker.all_rpd_exhausted(len(config.GEMINI_API_KEYS)):
        logger.warning(
            "All %d API key(s) RPD-exhausted today — skipping run. "
            "Quota resets at midnight UTC.",
            len(config.GEMINI_API_KEYS),
        )
        _write_summary(
            "⏭️ Skipped — all API keys hit daily quota. Resets at midnight UTC."
        )
        return

    github = GitHubManager()
    commits_before = state.get("total_commits", 0)
    failure: Exception | None = None

    try:
        for i in range(tasks_per_run):
            if tasks_per_run > 1:
                logger.info("--- Iteration %d/%d ---", i + 1, tasks_per_run)
            state = _run_one_task(state, github, logger)
    except Exception as exc:  # noqa: BLE001 — state must survive any crash
        failure = exc
    finally:
        # Quota learnings (404 models, RPD-exhausted keys) persist even when
        # the run fails, so the next run doesn't repeat the same doomed calls.
        _save_state(state)

    committed = state.get("total_commits", 0) - commits_before
    if failure is not None:
        logger.error("Run failed: %s", failure)
        _write_summary(f"❌ Run failed after {committed} commit(s): {failure}")
        raise failure
    if committed:
        _write_summary(f"✅ Committed {committed} task(s).")
    else:
        _write_summary(
            "⏭️ No task committed this run (quota or transient API issues). "
            "Will retry next scheduled run."
        )
    logger.info("=== Run complete ===")


if __name__ == "__main__":
    run()
