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
    """Runs a git command in the root repository, handling push robustness."""
    # If the command is a push without specific destination targets, make it robust
    if args and args[0] == "push" and len(args) == 1:
        branch = os.environ.get("RENDER_GIT_BRANCH", "")
        if not branch:
            result = subprocess.run(["git", "rev-parse", "--abbrev-ref", "HEAD"], cwd=str(ROOT_DIR), capture_output=True, text=True)
            if result.returncode == 0 and result.stdout.strip() != "HEAD":
                branch = result.stdout.strip()
        if not branch:
            result = subprocess.run(["git", "status"], cwd=str(ROOT_DIR), capture_output=True, text=True)
            if result.returncode == 0 and "On branch " in result.stdout:
                for line in result.stdout.split("\n"):
                    if "On branch " in line:
                        branch = line.replace("On branch ", "").strip()
                        break
        if not branch:
            branch = "main"

        token = os.environ.get("GITHUB_TOKEN", "")
        if token:
            res_remote = subprocess.run(["git", "remote", "get-url", "origin"], cwd=str(ROOT_DIR), capture_output=True, text=True)
            if res_remote.returncode == 0:
                remote_url = res_remote.stdout.strip()
                import re
                match = re.search(r"github\.com[:/]([^/]+)/([^.]+)(?:\.git)?", remote_url)
                if match:
                    owner = match.group(1)
                    repo_name = match.group(2)
                    authenticated_url = f"https://{token}@github.com/{owner}/{repo_name}.git"
                    args = ["push", authenticated_url, f"HEAD:{branch}"]
        else:
            args = ["push", "origin", f"HEAD:{branch}"]

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

def update_project_context(state: dict) -> None:
    """Scans the generated app codebase and compiles a comprehensive project_context.md file."""
    context_path = ROOT_DIR / "automation" / "project_context.md"
    logger.info("Compiling global project context manifest...")
    
    lines = []
    lines.append(f"# Project Context Manifest: {state['project'].get('title', 'SaaS App')}")
    lines.append(f"Description: {state['project'].get('description', '')}\n")
    
    # 1. Project Specifications
    lines.append("## Core Specifications")
    lines.append(f"- **Scope:** {state['project'].get('project_scope', 'saas')}")
    lines.append(f"- **Milestones Count:** {state['project'].get('target_milestones', 5)}")
    
    tech_stack = state["project"].get("tech_stack", {})
    lines.append(f"- **Backend Framework:** {tech_stack.get('backend_lang', 'Node.js')}")
    lines.append(f"- **Styling Framework:** {tech_stack.get('frontend_css', 'Tailwind CSS')}")
    
    features = state["project"].get("selected_features", [])
    if features:
        lines.append(f"- **Required Features:** {', '.join(features)}")
    lines.append("\n")
    
    # 2. Database Schema Details
    lines.append("## JSON Database Schema Design")
    schema = state.get("architecture", {}).get("db_schema", {})
    lines.append("```yaml")
    import yaml
    lines.append(yaml.dump(schema))
    lines.append("```\n")
    
    # 3. API Contracts
    lines.append("## API Endpoints & Routes Contracts")
    contracts = state.get("architecture", {}).get("api_contracts", {})
    lines.append("```yaml")
    lines.append(yaml.dump(contracts))
    lines.append("```\n")

    # 4. Workspace Source Code Directory Scan
    lines.append("## Workspace Source Code Files")
    app_dir = ROOT_DIR / "app"
    if app_dir.exists():
        for root, dirs, files in os.walk(str(app_dir)):
            if any(p in root for p in ["node_modules", "dist", ".git"]):
                continue
            for file in files:
                if file in ["package-lock.json", "yarn.lock", "pnpm-lock.yaml"]:
                    continue
                file_path = Path(root) / file
                rel_path = file_path.relative_to(app_dir).as_posix()
                
                # Only include code files
                if file.split('.')[-1] in ["tsx", "ts", "js", "html", "css", "json", "toml", "config"]:
                    try:
                        with open(file_path, "r", encoding="utf-8") as f:
                            content = f.read()
                        
                        # Guard against reading huge text files
                        if len(content) > 50000:
                            content = content[:50000] + "\n\n... [Content Truncated due to size limit] ..."
                            
                        lines.append(f"### File: `app/{rel_path}`")
                        ext = file.split('.')[-1]
                        lines.append(f"```{ext}")
                        lines.append(content)
                        lines.append("```\n")
                    except Exception as e:
                        logger.warning("Failed to include %s in context: %s", rel_path, e)
                        
    try:
        with open(context_path, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
        logger.info("Successfully compiled project_context.md")
    except Exception as e:
        logger.error("Failed to write project_context.md: %s", e)

def run_pipeline() -> None:
    _setup_logging()
    logger.info("=== Starting Autonomous Pipeline Run ===")
    
    # 1. Load state
    state = state_manager.load_state()
    update_project_context(state)
    start_time = time.time()

    # --- HEARTBEAT COMMIT ---
    # Persist a timestamped state immediately so that even if all LLM providers
    # are exhausted today, we still produce at least one commit (keeping streak alive).
    state_manager.save_state(state)
    run_git_command(["add", "automation/project_state.yaml", "automation/project_context.md"])
    _stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    ok, out = run_git_command(["commit", "-m", f"chore(heartbeat): daily run started {_stamp}"])
    if ok:
        logger.info("Heartbeat commit created: %s", out)
        run_git_command(["push"])
    else:
        logger.info("Heartbeat commit skipped (nothing to commit or push failed): %s", out)
    # --- END HEARTBEAT ---
    
    # 2. Check if project is empty/idle
    if state["project"]["status"] == "idle":
        logger.info("No active project. Starting project selection & planning...")
        trending = _get_trending(state)
        
        try:
            custom_idea = state["project"].get("custom_idea")
            custom_title = state["project"].get("custom_title")
            target_milestones = state["project"].get("target_milestones", 5)
            project_scope = state["project"].get("project_scope", "saas")
            selected_features = state["project"].get("selected_features", [])
            tech_stack = state["project"].get("tech_stack")
            
            if custom_idea:
                logger.info("Found custom idea in state: '%s'. Customizing project spec...", custom_idea)
            plan = plan_new_project(
                trending,
                custom_idea=custom_idea,
                custom_title=custom_title,
                target_milestones=target_milestones,
                project_scope=project_scope,
                selected_features=selected_features,
                tech_stack=tech_stack
            )
            
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
            settings = state.get("settings", {})
            repair_limit = settings.get("auto_repair_limit", 3)
            for repair_idx in range(1, repair_limit + 1):
                logger.info("Repair attempt %d/%d...", repair_idx, repair_limit)
                
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
                
                # Update context manifest after success
                update_project_context(state)
                
                # Save state and commit it
                state_manager.save_state(state)
                run_git_command(["add", "automation/project_state.yaml"])
                run_git_command(["add", "automation/project_context.md"])
                run_git_command(["commit", "-m", f"chore(state): sync state and context after task {task['id']}"])
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
