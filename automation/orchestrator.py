import os
import sys
import logging
import time
import subprocess
from datetime import datetime, timezone
from pathlib import Path

# Ensure project root is in python path to resolve absolute imports
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from automation import config, state_manager, quality_gates
from automation.trend_finder import get_trending_topics
from automation.project_planner import plan_new_project, generate_task_code, repair_task_code

logger = logging.getLogger(__name__)

def _setup_logging() -> None:
    config.LOGS_DIR.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    log_file = config.LOGS_DIR / f"run_{stamp}.log"
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler(log_file),
        ],
    )

def _get_trending(state: dict) -> dict:
    """Gets trending topics from HN/GitHub, cached daily."""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    cache = state.get("trending_cache", {})
    if cache.get("date") == today and cache.get("data"):
        logger.info("Using cached trending topics for today")
        return cache["data"]
        
    logger.info("Scraping fresh trending topics...")
    data = get_trending_topics()
    state["trending_cache"] = {
        "date": today,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "data": data
    }
    state_manager.save_state(state)
    return data

def run_git_command(args: list[str]) -> tuple[bool, str]:
    """Runs a git command in the root repository."""
    try:
        # Configure git identity locally if not already set (important for cloud environments like Render)
        username = config.GITHUB_USERNAME or "Ajain0311"
        subprocess.run(["git", "config", "user.name", username], cwd=str(ROOT_DIR), capture_output=True)
        subprocess.run(["git", "config", "user.email", f"{username}@users.noreply.github.com"], cwd=str(ROOT_DIR), capture_output=True)

        result = subprocess.run(
            ["git"] + args,
            cwd=str(ROOT_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        if result.returncode == 0:
            return True, result.stdout.strip()
        else:
            return False, result.stderr.strip()
    except Exception as e:
        return False, str(e)

def run_pipeline() -> None:
    _setup_logging()
    logger.info("=== Starting Autonomous Pipeline Run ===")
    
    # 1. Load state
    state = state_manager.load_state()
    start_time = time.time()
    
    # 2. Check if project is empty/idle
    if state["project"]["status"] == "idle":
        logger.info("No active project. Starting project selection & planning...")
        trending = _get_trending(state)
        
        try:
            custom_idea = state["project"].get("custom_idea")
            if custom_idea:
                logger.info("Found custom idea in state: '%s'. Customizing project spec...", custom_idea)
            plan = plan_new_project(trending, custom_idea=custom_idea)
            
            # Populate project state
            state["project"]["name"] = plan["project"]["name"]
            state["project"]["title"] = plan["project"]["title"]
            state["project"]["description"] = plan["project"]["description"]
            state["project"]["vision"] = plan["project"]["vision"]
            state["project"]["status"] = "selected"
            state["project"]["created_at"] = datetime.now(timezone.utc).isoformat()
            
            state["architecture"] = plan["architecture"]
            state["milestones"] = plan["milestones"]
            state["priorities"] = plan["priorities"]
            state["dependencies"] = plan["dependencies"]
            state["tech_debt"] = plan["tech_debt"]
            
            state_manager.add_audit_log(state, "project_selected", f"Selected project: {plan['project']['title']}")
            state_manager.save_state(state)
            
            logger.info("Successfully planned new project: %s", plan['project']['title'])
            
            # Commit the initial planning/scaffolding
            run_git_command(["add", "automation/project_state.yaml"])
            run_git_command(["commit", "-m", f"chore(planning): initialize plan for {plan['project']['title']}"])
            run_git_command(["push"])
            
        except Exception as e:
            logger.error("Failed to plan project: %s", e)
            state["last_run"] = {
                "success": False,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error_message": f"Planning failed: {e}",
                "duration_seconds": int(time.time() - start_time),
                "retry_count": 0
            }
            state_manager.save_state(state)
            return

    # 3. Find next task
    milestone, task = state_manager.get_next_task(state)
    if not task:
        logger.info("No pending tasks. Project is fully complete!")
        state["project"]["status"] = "completed"
        state_manager.save_state(state)
        return
        
    logger.info("Running task: %s - %s", task["id"], task["name"])
    
    # Track done tasks names
    done_tasks = []
    for m in state.get("milestones", []):
        for t in m.get("tasks", []):
            if t.get("status") == "completed":
                done_tasks.append(t["name"])
                
    # 4. Generate code
    try:
        impl = generate_task_code(
            project_title=state["project"]["title"],
            project_desc=state["project"]["description"],
            task=task,
            done_tasks=done_tasks
        )
        
        file_contents = impl.get("file_contents", {})
        commit_message = impl.get("commit_message") or f"feat: implement {task['name']}"
        
        if not file_contents:
            raise ValueError("LLM generated no file contents.")
            
        # Write files locally to app/
        written_paths = []
        for rel_path, content in file_contents.items():
            full_path = ROOT_DIR / "app" / rel_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(content)
            written_paths.append(rel_path)
            
        logger.info("Wrote generated files: %s", ", ".join(written_paths))
        
        # 5. Quality Gates (Build Verification)
        success, errors = quality_gates.verify_build(written_paths)
        
        # Repair Loop
        if not success:
            logger.warning("Quality gates failed. Starting auto-repair loop...")
            for repair_idx in range(1, 4):
                logger.info("Repair attempt %d/3...", repair_idx)
                
                # Load current modified files contents
                modified_contents = {}
                for path in written_paths:
                    full_path = ROOT_DIR / "app" / path
                    if full_path.exists():
                        with open(full_path, "r", encoding="utf-8") as f:
                            modified_contents[path] = f.read()
                            
                repaired = repair_task_code(task, errors, modified_contents)
                repaired_files = repaired.get("file_contents", {})
                
                if not repaired_files:
                    logger.warning("Auto-repair generated no file corrections.")
                    continue
                    
                # Write repaired files
                for rel_path, content in repaired_files.items():
                    full_path = ROOT_DIR / "app" / rel_path
                    full_path.parent.mkdir(parents=True, exist_ok=True)
                    with open(full_path, "w", encoding="utf-8") as f:
                        f.write(content)
                        
                # Re-verify build
                success, errors = quality_gates.verify_build(written_paths)
                if success:
                    logger.info("Auto-repair succeeded! Quality gates passed.")
                    break
                    
        # 6. Final check
        if success:
            # Stage changes
            run_git_command(["add", "app/"])
            
            # Commit files
            commit_ok, commit_output = run_git_command(["commit", "-m", commit_message])
            if commit_ok:
                # Get commit SHA
                _, sha_output = run_git_command(["rev-parse", "HEAD"])
                sha = sha_output.strip()
                
                # Push
                run_git_command(["push"])
                
                # Mark completed
                state_manager.mark_task_status(state, task["id"], "completed", written_paths, sha)
                state_manager.add_audit_log(state, "task_completed", f"Task: {task['name']} (Commit: {sha[:7]})")
                
                # Save state and commit it
                state_manager.save_state(state)
                run_git_command(["add", "automation/project_state.yaml"])
                run_git_command(["commit", "-m", f"chore(state): sync state after task {task['id']}"])
                run_git_command(["push"])
                
                state["last_run"] = {
                    "success": True,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "error_message": "",
                    "duration_seconds": int(time.time() - start_time),
                    "retry_count": 0
                }
                state_manager.save_state(state)
                logger.info("Successfully completed task and committed.")
            else:
                raise RuntimeError(f"Git commit failed:\n{commit_output}")
        else:
            # Build failed and could not be repaired - discard build changes to keep repo clean
            logger.error("Build failed and could not be repaired. Reverting changes to maintain quality...")
            run_git_command(["checkout", "--", "app/"])
            run_git_command(["clean", "-fd", "app/"])
            
            state["last_run"] = {
                "success": False,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "error_message": f"Quality Gates build failures:\n{errors}",
                "duration_seconds": int(time.time() - start_time),
                "retry_count": state["last_run"].get("retry_count", 0) + 1
            }
            state_manager.save_state(state)
            
    except Exception as e:
        logger.error("Error running pipeline task: %s", e)
        # Revert changes
        run_git_command(["checkout", "--", "app/"])
        run_git_command(["clean", "-fd", "app/"])
        
        state["last_run"] = {
            "success": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error_message": str(e),
            "duration_seconds": int(time.time() - start_time),
            "retry_count": state["last_run"].get("retry_count", 0) + 1
        }
        state_manager.save_state(state)

if __name__ == "__main__":
    run_pipeline()
