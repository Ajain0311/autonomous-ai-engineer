import json
import logging
from pathlib import Path
from typing import Any, Dict, List

from automation.client import generate_with_failover

logger = logging.getLogger(__name__)
ROOT_DIR = Path(__file__).resolve().parent.parent

_PLAN_PROMPT = """\
You are an elite software architect and small software company CEO. Design a high-utility, production-grade commercial SaaS application.
This application must be built incrementally over 6-12 months, featuring a modular architecture with React + TS frontend, Node.js + Express backend, and a GitHub-backed JSON database.
We do NOT use external databases (like PostgreSQL, MySQL, Supabase, or SQLite). Instead:
- Every database table must be stored as its own individual JSON file inside a `db/` folder in the repository (e.g. `db/users.json`, `db/tasks.json`).
- Each file must contain a JSON array of objects representing rows.
- The Node.js/Express backend must read, parse, query, update, delete, and write back objects in these JSON files directly on disk, automatically committing and pushing the changes via git commands to remote on every write operation.

Trending data / themes to inspire you:
{trending}

BANNED (Too generic - do NOT plan these):
- Todo list, weather app, notes app, calculator, pomodoro, expense tracker, recipe finder, quiz app, kanban, chat clone, URL shortener, password generator.
- Basic hospital/ERP/POS/school management, basic e-commerce, basic landing pages.

Create a production-grade SaaS application idea that solves a real pain point for professional users, with deep milestones and a massive roadmap.

Generate a JSON response outlining the entire vision, roadmap, architecture, database schema, folder structure, auth design, API contracts, milestones, and a backlog of detailed, concrete tasks.

You must return ONLY a valid JSON object matching this structure:
{{
  "project": {{
    "name": "kebab-case-app-name",
    "title": "Clean App Title",
    "description": "Comprehensive description of value proposition and target users.",
    "vision": "Long-term vision for this product as a commercial SaaS."
  }},
  "architecture": {{
    "notes": "Overview of architecture (React Vite frontend, Node.js backend, Zustand, Tailwind).",
    "db_schema": "Detailed JSON database schemas, describing table objects (stored as JSON arrays in db/) and fields, along with read/write git-push trigger designs.",
    "folder_structure": "Map of key folders and file organization.",
    "auth_design": "Detailed local JSON/JWT Auth design (storing hashed user records in users.json).",
    "api_contracts": "Key API routes, methods, and request/response payloads."
  }},
  "milestones": [
    {{
      "id": 1,
      "title": "Project Scaffolding and Setup",
      "status": "pending",
      "tasks": [
        {{
          "id": "1.1",
          "name": "Initialize Directories and Configuration",
          "description": "Create basic folder layout for frontend and backend, configure package.json, tailwind.config.ts, and vite.config.ts.",
          "files": ["package.json", "vite.config.ts", "tsconfig.json", "index.html", "tailwind.config.js", "postcss.config.js", "netlify.toml", "src/main.tsx", "src/App.tsx", "src/index.css"],
          "type": "setup",
          "status": "pending"
        }}
      ]
    }}
  ],
  "priorities": ["Auth setup", "Core UI shell", "GitHub JSON DB configuration"],
  "dependencies": {{
    "1.2": ["1.1"]
  }},
  "tech_debt": ["Placeholder tracker for future refactoring tasks"]
}}

Make sure you output at least 5 major milestones, with a total of 15 to 25 detailed, granular, and sequential tasks. The tasks must start from simple scaffoldings and configuration, build the core layout, database integration, auth integration, core features, and finally advanced details.
Return ONLY valid JSON. No markdown ticks, no surrounding text.
"""

_CODE_PROMPT = """\
You are an expert full-stack developer writing production-grade, maintainable code.
We are building a SaaS application called "{title}" (Description: {description}).

Project Context & Source Code Manifest (Review this carefully to match existing architecture, routes, schemas and styles):
{project_context}

Tech Stack and Database Architecture:
- Frontend: React 18, TypeScript, TailwindCSS, Zustand state management, React Router v6.
- Backend: Express (Node.js) API.
- Database: GitHub-backed JSON Database. We do NOT use external/SQL databases (no Supabase, no SQLite).
- Table Storage: Every database table must be stored as its own individual JSON file containing a list of objects (e.g., `db/users.json`, `db/tasks.json` in the project root).
- CRUD Operations: Implement database read, write, update, and delete actions directly by reading the corresponding file, parsing the array of objects, performing object mutations (insert, update, delete), writing it back to disk, and automatically calling Git commands (`git add -A`, `git commit`, `git push`) to push changes.
- Helper Module: Scaffold a clean `db` or `JSONDatabase` helper in the backend to manage these CRUD operations for any table.

Task details to implement:
- Task ID: {task_id}
- Task Name: {task_name}
- Description: {task_desc}
- Target Files to produce/modify: {files}

Previously completed tasks/features:
{done_tasks}

Existing source code of target files currently in the workspace (read carefully to modify or extend without regressions):
{existing_code}

Instructions:
1. Provide the complete code content for each of the target files listed.
2. Ensure strict TypeScript types (no 'any'). Use modern Tailwind CSS styling.
3. Reuse any existing components, routers, stores, or utility functions - never duplicate code.
4. Output should include a Conventional Commits message (e.g. feat(auth): add email sign in).

Return ONLY a valid JSON object of this format:
{{
  "file_contents": {{
    "path/to/file.tsx": "Complete file content string...",
    "another/file.ts": "Complete file content string..."
  }},
  "npm_packages": ["package-name@version"],
  "commit_message": "feat(scope): conventional commit message"
}}
Return ONLY valid JSON.
"""

_REPAIR_PROMPT = """\
You are an expert debugging engineer. The codebase failed to compile or run after implementing the last task.
Task ID: {task_id}
Task Name: {task_name}

Errors encountered:
{errors}

Below are the contents of the files that were just written or modified:
{modified_files}

Identify the bugs, types issues, or compilation errors, and provide corrected versions of the files.
Return ONLY a valid JSON object of the same format:
{{
  "file_contents": {{
    "path/to/file.tsx": "Complete corrected file content string..."
  }},
  "npm_packages": [],
  "commit_message": "fix(build): resolve compilation and lint errors"
}}
Return ONLY valid JSON.
"""

def get_existing_files(file_paths: List[str]) -> Dict[str, str]:
    """Read the contents of the specified files from the workspace if they exist."""
    existing = {}
    for rel_path in file_paths:
        # Resolve path relative to app folder
        full_path = ROOT_DIR / "app" / rel_path
        if full_path.exists() and full_path.is_file():
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    existing[rel_path] = f.read()
            except Exception as e:
                logger.error("Failed to read file %s: %s", rel_path, e)
    return existing

def plan_new_project(trending_data: Dict, custom_idea: str = None,
                     custom_title: str = None, target_milestones: int = 5,
                     project_scope: str = "saas", selected_features: List[str] = None,
                     tech_stack: Dict = None) -> Dict[str, Any]:
    """Analyze trends and generate a master spec plan for a new target SaaS product."""
    logger.info("Generating project plan with custom specifications...")
    
    custom_instr = []
    if custom_idea:
        custom_instr.append(f"- Focus specifically on building this custom concept: {custom_idea}")
    if custom_title:
        custom_instr.append(f"- Name the project '{custom_title}' (use clean kebab-case name in project.name and title in project.title).")
    if target_milestones:
        custom_instr.append(f"- Plan exactly {target_milestones} milestones in the milestones array, scaling the scope appropriately.")
    if project_scope == "mvp":
        custom_instr.append("- Prioritize a rapid prototype backlog, including only essential core workflows to build a working MVP.")
    elif project_scope == "enterprise":
        custom_instr.append(
            "- Design a massive, enterprise-grade, multi-phase application architecture designed for a 1-year product lifecycle. "
            "Backlog must feature production-ready modular layouts, clean architecture patterns (e.g. separated controllers, services, repositories), "
            "comprehensive security middleware, database migrations, rigorous error tracking, unit/integration test suites, "
            "and performance optimizations. Generate highly detailed and granular tasks for all modules."
        )
    else:
        custom_instr.append("- Design a production-grade, highly structured commercial SaaS backlog featuring tests, setups, and complex routes.")
    if selected_features:
        custom_instr.append(f"- Ensure these specific features are planned and built: {', '.join(selected_features)}.")
    if tech_stack:
        backend_lang = tech_stack.get("backend_lang", "Node.js")
        frontend_css = tech_stack.get("frontend_css", "Tailwind CSS")
        custom_instr.append(f"- Technology Stack preferences: Backend={backend_lang}, CSS/Styling={frontend_css}.")
        if backend_lang.lower() == "python":
            custom_instr.append("- IMPORTANT: The backend must be written using Python (FastAPI/Flask) rather than Node.js/Express. Adapt folder structure and package manager to match.")
        if frontend_css.lower() == "vanilla":
            custom_instr.append("- IMPORTANT: All styling must use plain Vanilla CSS. Do NOT configure or use Tailwind CSS.")
            
    prefix = ""
    if custom_instr:
        prefix = "CRITICAL CUSTOM SPECIFICATIONS:\nYou MUST design this SaaS following these strict guidelines:\n" + "\n".join(custom_instr) + "\n\n"
        
    prompt = prefix + _PLAN_PROMPT.format(trending=json.dumps(trending_data, indent=2))
    
    # Generate plan with failover rotation
    result = generate_with_failover(prompt, temperature=0.7, require_json=True)
    if not isinstance(result, dict) or "project" not in result:
        raise ValueError("LLM returned invalid project plan structure.")
    return result

def generate_task_code(project_title: str, project_desc: str, task: Dict, done_tasks: List[str]) -> Dict[str, Any]:
    """Generate files code content for a specific task using multi-provider rotation."""
    target_files = task.get("files", [])
    existing_code = get_existing_files(target_files)
    
    # Load compiled project context
    project_context = ""
    context_path = ROOT_DIR / "automation" / "project_context.md"
    if context_path.exists():
        try:
            with open(context_path, "r", encoding="utf-8") as f:
                project_context = f.read()
        except Exception as e:
            logger.error("Failed to read project_context.md: %s", e)
            
    if not project_context:
        project_context = "No previous context compiled yet."
        
    prompt = _CODE_PROMPT.format(
        title=project_title,
        description=project_desc,
        project_context=project_context,
        task_id=task.get("id"),
        task_name=task.get("name"),
        task_desc=task.get("description"),
        files=json.dumps(target_files),
        done_tasks=json.dumps(done_tasks),
        existing_code=json.dumps(existing_code, indent=2)
    )
    
    logger.info("Generating code for task: %s (%s)", task.get("id"), task.get("name"))
    result = generate_with_failover(prompt, temperature=0.2, require_json=True)
    
    # Coerce file_contents to strings
    files = result.get("file_contents", {})
    if isinstance(files, dict):
        result["file_contents"] = {
            path: content if isinstance(content, str) else json.dumps(content, indent=2)
            for path, content in files.items()
        }
    return result

def repair_task_code(task: Dict, errors: str, modified_files: Dict[str, str]) -> Dict[str, Any]:
    """Generate corrections for compilation/test failures."""
    prompt = _REPAIR_PROMPT.format(
        task_id=task.get("id"),
        task_name=task.get("name"),
        errors=errors,
        modified_files=json.dumps(modified_files, indent=2)
    )
    
    logger.info("Attempting auto-repair for build errors in task: %s", task.get("id"))
    result = generate_with_failover(prompt, temperature=0.2, require_json=True)
    
    files = result.get("file_contents", {})
    if isinstance(files, dict):
        result["file_contents"] = {
            path: content if isinstance(content, str) else json.dumps(content, indent=2)
            for path, content in files.items()
        }
    return result
