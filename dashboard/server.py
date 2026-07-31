import os
import sys
import subprocess
import logging
import datetime
import threading
from pathlib import Path
from typing import Optional, Dict
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import yaml

from automation import state_manager
from automation.client import LLMClient, APIError, PROVIDER_MODELS

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("dashboard_server")

ROOT_DIR = Path(__file__).resolve().parent.parent
STATE_FILE = ROOT_DIR / "automation" / "project_state.yaml"
LOGS_DIR = ROOT_DIR / "automation" / "logs"
ENV_FILE = ROOT_DIR / ".env"

CONFIG_VAR_NAMES = [
    "DASHBOARD_PASSWORD", "GITHUB_TOKEN", "GITHUB_USERNAME", "NETLIFY_TOKEN", "GEMINI_MODEL",
    "GEMINI_API_KEYS", "GROQ_API_KEYS", "OPENROUTER_API_KEYS", "TOGETHER_API_KEYS",
    "MISTRAL_API_KEYS", "COHERE_API_KEYS", "HUGGINGFACE_API_KEYS", "GITHUB_MODELS_KEYS",
    "SAMBANOVA_API_KEYS", "KILO_API_KEYS", "SKIP_COMPILATION_GATES"
]

app = FastAPI(title="Autonomous AI Software Engineer Dashboard")

# Enable CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global pipeline runner state
pipeline_running = False
pipeline_log = ""

class StateUpdate(BaseModel):
    state: dict

class CommitRequest(BaseModel):
    message: str

class CheckoutRequest(BaseModel):
    branch: str

class LoginRequest(BaseModel):
    password: str

@app.post("/api/auth/login")
def login(payload: LoginRequest):
    expected_password = os.environ.get("DASHBOARD_PASSWORD", "admin")
    if payload.password == expected_password:
        return {"success": True, "token": "auth_token_v2"}
    else:
        raise HTTPException(status_code=401, detail="Invalid password pin.")

class ResetRequest(BaseModel):
    reason: Optional[str] = "User requested reset"

class KeysUpdateRequest(BaseModel):
    keys: Dict[str, str]

class ConnectionTestRequest(BaseModel):
    provider: str

def run_git_command(args: list[str]) -> tuple[bool, str]:
    """Helper to run git commands in root repo."""
    try:
        # Configure git identity locally if not already set (important for cloud environments like Render)
        username = os.environ.get("GITHUB_USERNAME", "Ajain0311")
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

def run_pipeline_task():
    global pipeline_running, pipeline_log
    pipeline_running = True
    pipeline_log = "Pipeline started...\n"
    try:
        proc = subprocess.Popen(
            [sys.executable, str(ROOT_DIR / "automation" / "orchestrator.py")],
            cwd=str(ROOT_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        while True:
            line = proc.stdout.readline()
            if not line:
                break
            pipeline_log += line
            logger.info(line.strip())
        proc.wait()
        pipeline_log += f"\nPipeline finished with exit code {proc.returncode}."
    except Exception as e:
        pipeline_log += f"\nError: {e}"
    finally:
        pipeline_running = False

# API endpoints
@app.get("/api/state")
def get_state():
    return state_manager.load_state()

@app.post("/api/state")
def update_state(payload: StateUpdate):
    try:
        state_manager.save_state(payload.state)
        return {"status": "success", "message": "State updated successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/logs")
def get_logs():
    if not LOGS_DIR.exists():
        return {"latest_log": "No logs folder exists yet.", "logs": []}
    files = sorted(LOGS_DIR.glob("run_*.log"), key=os.path.getmtime, reverse=True)
    log_list = [{"name": f.name, "time": datetime.datetime.fromtimestamp(f.stat().st_mtime).isoformat()} for f in files]
    
    latest_content = ""
    if files:
        try:
            with open(files[0], "r", encoding="utf-8") as f:
                latest_content = f.read()
        except Exception as e:
            latest_content = f"Error reading log: {e}"
            
    return {
        "latest_log": latest_content,
        "logs": log_list[:20]
    }

@app.get("/api/git/status")
def get_git_status():
    ok_branch, branch = run_git_command(["rev-parse", "--abbrev-ref", "HEAD"])
    ok_status, status = run_git_command(["status", "--porcelain"])
    ok_behind, behind = run_git_command(["rev-list", "--count", "HEAD..origin/HEAD"])
    ok_ahead, ahead = run_git_command(["rev-list", "--count", "origin/HEAD..HEAD"])
    
    changes = []
    if ok_status and status:
        for line in status.split("\n"):
            if line.strip():
                parts = line.strip().split(maxsplit=1)
                if len(parts) == 2:
                    changes.append({"status": parts[0], "file": parts[1]})
                    
    return {
        "branch": branch if ok_branch else "unknown",
        "behind": int(behind) if ok_behind else 0,
        "ahead": int(ahead) if ok_ahead else 0,
        "uncommitted_changes": changes
    }

@app.get("/api/git/diff")
def get_git_diff():
    ok, diff = run_git_command(["diff"])
    if not ok:
        raise HTTPException(status_code=500, detail=diff)
    return {"diff": diff}

@app.get("/api/git/commit-diff")
def get_commit_diff(sha: str):
    ok, diff = run_git_command(["show", sha])
    if not ok:
        raise HTTPException(status_code=500, detail=diff)
    return {"diff": diff}

class FileWriteRequest(BaseModel):
    path: str
    content: str

@app.get("/api/files/list")
def list_files():
    files = []
    ignore_dirs = {".git", "node_modules", "__pycache__", "dist", ".vite", ".netlify"}
    for root, dirs, filenames in os.walk(ROOT_DIR):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        for f in filenames:
            full_path = Path(root) / f
            rel_path = full_path.relative_to(ROOT_DIR)
            if f == ".env" or f.endswith((".pyc", ".png", ".jpg", ".ico", ".svg")):
                continue
            files.append(str(rel_path).replace("\\", "/"))
    return {"files": sorted(files)}

@app.get("/api/files/read")
def read_file(path: str):
    try:
        # Prevent traversal
        safe_path = (ROOT_DIR / path).resolve()
        if not str(safe_path).startswith(str(ROOT_DIR.resolve())):
            raise HTTPException(status_code=403, detail="Path traversal detected.")
        if not safe_path.exists() or not safe_path.is_file():
            raise HTTPException(status_code=404, detail="File not found.")
        with open(safe_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/files/write")
def write_file(payload: FileWriteRequest):
    try:
        safe_path = (ROOT_DIR / payload.path).resolve()
        if not str(safe_path).startswith(str(ROOT_DIR.resolve())):
            raise HTTPException(status_code=403, detail="Path traversal detected.")
        safe_path.parent.mkdir(parents=True, exist_ok=True)
        with open(safe_path, "w", encoding="utf-8") as f:
            f.write(payload.content)
        return {"status": "success", "message": f"File {payload.path} saved successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class FileDeleteRequest(BaseModel):
    path: str

@app.post("/api/files/delete")
def delete_file(payload: FileDeleteRequest):
    try:
        safe_path = (ROOT_DIR / payload.path).resolve()
        if not str(safe_path).startswith(str(ROOT_DIR.resolve())):
            raise HTTPException(status_code=403, detail="Path traversal detected.")
        if safe_path.exists() and safe_path.is_file():
            safe_path.unlink()
            return {"status": "success", "message": f"File {payload.path} deleted successfully."}
        raise HTTPException(status_code=404, detail="File not found.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/git/commit")
def git_commit(payload: CommitRequest):
    run_git_command(["add", "-A"])
    ok, output = run_git_command(["commit", "-m", payload.message])
    if not ok:
        raise HTTPException(status_code=500, detail=output)
    return {"status": "success", "message": "Changes committed.", "output": output}

@app.post("/api/git/push")
def git_push():
    ok, output = run_git_command(["push"])
    if not ok:
        raise HTTPException(status_code=500, detail=output)
    return {"status": "success", "message": "Pushed to remote repository.", "output": output}

@app.post("/api/git/pull")
def git_pull():
    ok, output = run_git_command(["pull"])
    if not ok:
        raise HTTPException(status_code=500, detail=output)
    return {"status": "success", "message": "Pulled from remote repository.", "output": output}

@app.get("/api/git/unstaged-changes")
def get_unstaged_changes():
    ok, output = run_git_command(["status", "--porcelain"])
    if not ok:
        raise HTTPException(status_code=500, detail=output)
    
    changes = []
    for line in output.split("\n"):
        if len(line) > 3:
            status = line[:2].strip()
            filepath = line[3:].strip()
            # If renamed, git status displays "R  old -> new"
            if " -> " in filepath:
                filepath = filepath.split(" -> ")[-1].strip()
            
            change_type = "modified"
            if status == "A":
                change_type = "added"
            elif status == "D":
                change_type = "deleted"
            elif status in ["??", "?"]:
                change_type = "untracked"
                
            changes.append({
                "file": filepath,
                "type": change_type,
                "status": status
            })
    return {"changes": changes}

@app.get("/api/git/unstaged-diff")
def get_unstaged_diff(file: str):
    # Sanitize path to prevent traversal
    safe_path = (ROOT_DIR / file).resolve()
    if not str(safe_path).startswith(str(ROOT_DIR.resolve())):
        raise HTTPException(status_code=403, detail="Path traversal detected.")
        
    # Get status of file
    ok, status_out = run_git_command(["status", "--porcelain", "--", file])
    is_untracked = False
    if ok and status_out.startswith("??"):
        is_untracked = True

    if is_untracked:
        try:
            if safe_path.exists() and safe_path.is_file():
                with open(safe_path, "r", encoding="utf-8") as f:
                    content = f.read()
                diff_lines = [f"+{line}" for line in content.splitlines()]
                diff = "\n".join(diff_lines)
                return {"diff": diff}
            else:
                return {"diff": "File deleted or not found."}
        except Exception as e:
            return {"diff": f"Error loading content: {e}"}
            
    ok, diff = run_git_command(["diff", "HEAD", "--", file])
    if not ok or not diff.strip():
        ok, diff = run_git_command(["diff", "--", file])
        
    return {"diff": diff}

@app.post("/api/git/checkout")
def git_checkout(payload: CheckoutRequest):
    ok, output = run_git_command(["checkout", payload.branch])
    if not ok:
        raise HTTPException(status_code=500, detail=output)
    return {"status": "success", "message": f"Switched to branch {payload.branch}.", "output": output}

@app.get("/api/git/log")
def get_git_log():
    ok, log = run_git_command(["log", "-n", "30", "--pretty=format:%h|%an|%ad|%s", "--date=short"])
    if not ok:
        raise HTTPException(status_code=500, detail=log)
    commits = []
    for line in log.split("\n"):
        if line.strip():
            parts = line.split("|")
            if len(parts) == 4:
                commits.append({
                    "sha": parts[0],
                    "author": parts[1],
                    "date": parts[2],
                    "message": parts[3]
                })
    return {"commits": commits}

@app.post("/api/run")
def trigger_pipeline(background_tasks: BackgroundTasks):
    global pipeline_running
    if pipeline_running:
        return {"status": "error", "message": "Pipeline is already running."}
    background_tasks.add_task(run_pipeline_task)
    return {"status": "success", "message": "Pipeline triggered successfully in the background."}

@app.get("/api/run/status")
def get_run_status():
    global pipeline_running, pipeline_log
    return {
        "running": pipeline_running,
        "log": pipeline_log
    }

@app.post("/api/reset")
def start_from_scratch(payload: ResetRequest):
    state = state_manager.load_state()
    project_name = state["project"]["name"] or "unnamed-project"
    stamp = datetime.datetime.now().strftime("%Y%m%d-%H%M%S")
    archive_branch = f"archive/{project_name}-{stamp}"
    
    logger.info("Starting archive process on branch %s...", archive_branch)
    
    # 1. Create and push archive branch
    run_git_command(["checkout", "-b", archive_branch])
    run_git_command(["add", "."])
    run_git_command(["commit", "-m", f"archive: store snapshot of {project_name}"])
    run_git_command(["push", "-u", "origin", archive_branch])
    
    # 2. Switch back to main branch
    run_git_command(["checkout", "main"])
    
    # 3. Wipe generated app folders
    app_dir = ROOT_DIR / "app"
    if app_dir.exists():
        try:
            import shutil
            shutil.rmtree(app_dir)
            app_dir.mkdir(exist_ok=True)
            logger.info("Deleted generated app directory files.")
        except Exception as e:
            logger.error("Failed to delete app directory: %s", e)
            
    # 4. Reset project spec tracking state
    reset_state = state_manager.DEFAULT_STATE.copy()
    reset_state["project"]["status"] = "idle"
    
    state_manager.add_audit_log(
        reset_state, 
        "project_reset", 
        f"Reset project. Archived {project_name} at branch {archive_branch}. Reason: {payload.reason}", 
        author="User"
    )
    state_manager.save_state(reset_state)
    
    # 5. Commit and push clean slate
    run_git_command(["add", "app/"])
    run_git_command(["add", "automation/project_state.yaml"])
    run_git_command(["commit", "-m", f"reset: start from scratch — archived {project_name} to {archive_branch}"])
    run_git_command(["push"])
    
    return {
        "status": "success",
        "message": f"Wiped successfully. Old project archived at branch: {archive_branch}"
    }

@app.get("/api/config/keys")
def get_config_keys():
    """Reads current API keys from environment variables and local .env file."""
    keys = {}
    # 1. Read from OS environment variables first (important for Render deployment)
    for var in CONFIG_VAR_NAMES:
        val = os.environ.get(var)
        if val:
            keys[var] = val
            
    # 2. Supplementary/Override with .env file if it exists
    if ENV_FILE.exists():
        try:
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if "=" in line and not line.strip().startswith("#"):
                        parts = line.strip().split("=", 1)
                        if len(parts) == 2:
                            keys[parts[0].strip()] = parts[1].strip()
        except Exception as e:
            logger.error("Failed to read env file: %s", e)
    return {"keys": keys}

@app.post("/api/config/keys")
def update_config_keys(payload: KeysUpdateRequest):
    """Updates API keys in the local .env file."""
    current_keys = {}
    if ENV_FILE.exists():
        try:
            with open(ENV_FILE, "r", encoding="utf-8") as f:
                for line in f:
                    if "=" in line and not line.strip().startswith("#"):
                        parts = line.strip().split("=", 1)
                        if len(parts) == 2:
                            current_keys[parts[0].strip()] = parts[1].strip()
        except Exception as e:
            logger.error("Failed to read env file: %s", e)
            
    # Update with new values
    for k, v in payload.keys.items():
        current_keys[k] = v
        
    # Write back
    try:
        with open(ENV_FILE, "w", encoding="utf-8") as f:
            f.write("# API Keys for Autonomous AI Software Engineer\n")
            for k, v in current_keys.items():
                f.write(f"{k}={v}\n")
        return {"status": "success", "message": "API keys saved to .env."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to write env file: {e}")

@app.post("/api/config/test")
def test_connection(payload: ConnectionTestRequest):
    """Tests LLM provider connectivity by attempting a 1-token completion call."""
    provider = payload.provider
    # Reload environment variables to pick up recent changes
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=str(ENV_FILE), override=True)
    
    # Reload config API keys lists
    from importlib import reload
    from automation import config
    reload(config)
    
    # Grab keys for this provider
    if provider == "github":
        env_var_name = "GITHUB_MODELS_KEYS"
    elif provider == "huggingface":
        env_var_name = "HUGGINGFACE_API_KEYS"
    else:
        env_var_name = f"{provider.upper()}_API_KEYS"
    keys_raw = os.environ.get(env_var_name, "") or os.environ.get(f"{provider.upper()}_API_KEY", "")
    keys = [k.strip() for k in keys_raw.split(",") if k.strip()]
    
    if not keys:
        return {"status": "error", "message": f"No API keys configured for {provider}."}
        
    models = PROVIDER_MODELS.get(provider, [])
    if not models:
        return {"status": "error", "message": f"No models configured for {provider}."}
        
    test_key = keys[0]
    test_model = models[0]
    
    logger.info("Testing connection to %s using model %s", provider, test_model)
    client = LLMClient(provider, test_key, 0)
    try:
        # Run brief test query
        res = client.generate(test_model, "Hi", temperature=0.1)
        if res:
            return {"status": "success", "message": "Connection active. Status code 200 OK."}
        else:
            return {"status": "error", "message": "API returned empty response."}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# Serve the static UI files from the frontend build
static_dir = ROOT_DIR / "dashboard" / "dist"
if static_dir.exists() and static_dir.is_dir():
    app.mount("/", StaticFiles(directory=str(static_dir), html=True), name="static")
else:
    logger.warning("Dashboard static folder '%s' does not exist yet.", static_dir)
