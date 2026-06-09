"""
Main entry point for the daily automation run.

Flow:
  1. Load state.json
  2. If no active project (or all tasks done) → pick a new idea via Gemini
  3. Create GitHub repo + Netlify site for new projects
  4. Generate code for the next pending task with Gemini
  5. Commit files to the project repo
  6. Persist updated state.json
"""

import logging
import sys
from datetime import datetime, timezone
from pathlib import Path

from automation import config
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


def _setup_logging() -> None:
    config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
    log_file = config.LOGS_DIR / f"run_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file),
        ],
    )


def _start_new_project(state: dict, github: GitHubManager) -> dict:
    """Find a trending idea, plan it, create the repo, and wire up Netlify."""
    logger = logging.getLogger(__name__)

    logger.info("Fetching trending topics…")
    trending = get_trending_topics()

    logger.info("Planning new project with Gemini…")
    done_names = get_completed_project_names(state)
    plan = plan_new_project(trending, done_names)

    state = set_new_project(state, plan)
    project = get_current_project(state)

    logger.info("Creating GitHub repo: %s", project["name"])
    repo_url = github.create_repo(project["name"], project["description"])
    project["github_url"] = repo_url

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

    save_state(state)
    return state


def run() -> None:
    _setup_logging()
    logger = logging.getLogger(__name__)
    logger.info("=== Daily Code Automation — %s ===", datetime.now(timezone.utc).date())

    config.validate()

    state = load_state()
    github = GitHubManager()
    project = get_current_project(state)

    # Archive completed project before starting fresh
    if project and is_project_complete(state):
        logger.info("Project '%s' fully complete.", project["name"])
        if config.NETLIFY_TOKEN and project.get("netlify_site_id"):
            try:
                netlify = NetlifyManager()
                deploy = netlify.get_deploy_status(project["netlify_site_id"])
                if deploy["state"] == "ready":
                    state = complete_current_project(
                        state, deploy["url"], project["github_url"] or ""
                    )
                    save_state(state)
            except Exception as exc:
                logger.warning("Could not fetch Netlify deploy status: %s", exc)
        project = None

    if not project:
        state = _start_new_project(state, github)

    project = get_current_project(state)
    task = get_next_task(state)

    if not task:
        logger.info("No pending tasks — nothing to do today.")
        return

    logger.info("Task [%d/%d]: %s", task["id"], len(project["tasks"]), task["name"])

    done_tasks = get_completed_tasks(state)

    logger.info("Generating code with Gemini…")
    impl = generate_task_code(project, task, done_tasks)

    files: dict = impl.get("file_contents", {})
    commit_msg: str = impl.get("commit_message") or f"feat: {task['name']}"

    if not files:
        logger.warning("Gemini returned no files for this task — skipping commit.")
        return

    logger.info("Committing %d file(s) to %s…", len(files), project["name"])
    sha = github.commit_files(
        repo_name=project["name"],
        files=files,
        message=commit_msg,
    )

    state = mark_task_done(state, task["id"], sha)
    save_state(state)

    remaining = sum(1 for t in project["tasks"] if t.get("status") == "pending") - 1
    logger.info(
        "Done. Commit %s | %d task(s) remaining in '%s'",
        sha[:7],
        max(remaining, 0),
        project["name"],
    )
    logger.info("=== Run complete ===")


if __name__ == "__main__":
    run()
