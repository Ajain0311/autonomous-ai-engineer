import os
import yaml
from pathlib import Path
import datetime

ROOT_DIR = Path(__file__).resolve().parent.parent
STATE_FILE = ROOT_DIR / "automation" / "project_state.yaml"

DEFAULT_STATE = {
    "project": {
        "name": "",
        "description": "",
        "vision": "",
        "status": "idle",  # idle | selected | planning | building | completed
        "repository_url": "",
        "deployment_url": "",
        "created_at": "",
        "updated_at": ""
    },
    "architecture": {
        "notes": "Define core design principles and architectural boundaries.",
        "db_schema": "Supabase database schema and migrations.",
        "folder_structure": "Directory organization mapping.",
        "auth_design": "Supabase Auth configuration and flow.",
        "api_contracts": "REST endpoints and API payload contracts."
    },
    "milestones": [],
    "backlog": [],
    "priorities": [],
    "dependencies": {},
    "known_issues": [],
    "tech_debt": [],
    "release_notes": [],
    "audit_trail": [],  # Unified log of all AI/manual operations, resets, commits
    "token_metadata": {
        "total_used": 0,
        "daily_budget": 5000000,
        "daily_used": 0,
        "last_reset_date": ""
    },
    "last_run": {
        "success": True,
        "timestamp": "",
        "error_message": "",
        "duration_seconds": 0,
        "retry_count": 0
    }
}

def load_state() -> dict:
    """Load the project state from project_state.yaml, creating it if missing."""
    if not STATE_FILE.exists():
        save_state(DEFAULT_STATE)
        return DEFAULT_STATE.copy()
    try:
        with open(STATE_FILE, "r", encoding="utf-8") as f:
            state = yaml.safe_load(f)
            if not state:
                return DEFAULT_STATE.copy()
            # Ensure basic keys exist
            for k, v in DEFAULT_STATE.items():
                if k not in state:
                    state[k] = v
            return state
    except Exception:
        return DEFAULT_STATE.copy()

def save_state(state: dict) -> None:
    """Save the state dictionary to project_state.yaml."""
    state["project"]["updated_at"] = datetime.datetime.now().isoformat()
    # Reset daily token budget if date changed
    today = datetime.date.today().isoformat()
    if state.get("token_metadata", {}).get("last_reset_date") != today:
        state.setdefault("token_metadata", {})["daily_used"] = 0
        state["token_metadata"]["last_reset_date"] = today
        
    STATE_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(STATE_FILE, "w", encoding="utf-8") as f:
        yaml.safe_dump(state, f, default_flow_style=False, sort_keys=False, allow_unicode=True)

def add_audit_log(state: dict, action: str, details: str, author: str = "AI") -> None:
    """Add a record to the audit trail log."""
    log_entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "author": author,
        "action": action,
        "details": details
    }
    state.setdefault("audit_trail", []).append(log_entry)

def get_next_task(state: dict) -> tuple[dict, dict] | tuple[None, None]:
    """
    Finds the first 'pending' task in the list of milestones.
    Returns (milestone, task) or (None, None) if everything is completed.
    """
    for milestone in state.get("milestones", []):
        for task in milestone.get("tasks", []):
            if task.get("status") == "pending":
                return milestone, task
    return None, None

def mark_task_status(state: dict, task_id: str, status: str, files_touched: list = None, commit_sha: str = None) -> bool:
    """
    Updates the status of a specific task by ID.
    If all tasks in a milestone are completed, marks the milestone completed.
    """
    modified = False
    for milestone in state.get("milestones", []):
        milestone_completed = True
        for task in milestone.get("tasks", []):
            if task.get("id") == task_id:
                task["status"] = status
                if files_touched:
                    task["files_touched"] = files_touched
                if commit_sha:
                    task["commit_sha"] = commit_sha
                modified = True
            if task.get("status") != "completed":
                milestone_completed = False
        
        if milestone_completed and milestone.get("status") != "completed":
            milestone["status"] = "completed"
            modified = True
            add_audit_log(state, "milestone_completed", f"Milestone: {milestone['title']}")
            
    if modified:
        save_state(state)
    return modified
