import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from automation import config

logger = logging.getLogger(__name__)


def load_state() -> Dict[str, Any]:
    if config.STATE_FILE.exists():
        with open(config.STATE_FILE) as f:
            return json.load(f)
    return {
        "current_project": None,
        "completed_projects": [],
        "total_commits": 0,
    }


def save_state(state: Dict[str, Any]) -> None:
    state["last_updated"] = datetime.now(timezone.utc).isoformat()
    config.STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(config.STATE_FILE, "w") as f:
        json.dump(state, f, indent=2)
    logger.info("State saved → %s", config.STATE_FILE)


def get_current_project(state: Dict) -> Optional[Dict]:
    return state.get("current_project")


def get_next_task(state: Dict) -> Optional[Dict]:
    project = get_current_project(state)
    if not project:
        return None
    for task in project.get("tasks", []):
        if task.get("status") == "pending":
            return task
    return None


def get_completed_tasks(state: Dict) -> List[Dict]:
    project = get_current_project(state)
    if not project:
        return []
    return [t for t in project.get("tasks", []) if t.get("status") == "done"]


def is_project_complete(state: Dict) -> bool:
    project = get_current_project(state)
    if not project:
        return True
    tasks = project.get("tasks", [])
    return bool(tasks) and all(t.get("status") == "done" for t in tasks)


def set_new_project(state: Dict, plan: Dict) -> Dict:
    current = state.get("current_project")
    if current:
        _archive_project(state, current)

    plan["tasks"] = [{**t, "status": "pending"} for t in plan.get("tasks", [])]
    plan["created_at"] = datetime.now(timezone.utc).isoformat()
    plan["github_url"] = None
    plan["netlify_site_id"] = None
    plan["netlify_url"] = None
    state["current_project"] = plan
    return state


def mark_task_done(state: Dict, task_id: int, commit_sha: str) -> Dict:
    project = get_current_project(state)
    for task in project.get("tasks", []):
        if task["id"] == task_id:
            task["status"] = "done"
            task["commit_sha"] = commit_sha
            task["completed_at"] = datetime.now(timezone.utc).isoformat()
    state["total_commits"] = state.get("total_commits", 0) + 1
    return state


def complete_current_project(
    state: Dict, netlify_url: str, github_url: str
) -> Dict:
    current = state.get("current_project")
    if current:
        current["netlify_url"] = netlify_url
        current["github_url"] = github_url
        current["deployed_at"] = datetime.now(timezone.utc).isoformat()
        _archive_project(state, current)
        state["current_project"] = None
    return state


def get_completed_project_names(state: Dict) -> List[str]:
    return [p["name"] for p in state.get("completed_projects", [])]


def _archive_project(state: Dict, project: Dict) -> None:
    archive = {
        "name": project.get("name"),
        "title": project.get("title"),
        "github_url": project.get("github_url"),
        "netlify_url": project.get("netlify_url"),
        "archived_at": datetime.now(timezone.utc).isoformat(),
    }
    state.setdefault("completed_projects", []).append(archive)
