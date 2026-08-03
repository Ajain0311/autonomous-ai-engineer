# DailyCode Engine — Autonomous Micro-Product & GitHub Streak Manager 🚀🔥

**DailyCode Engine** is a production-grade, file-based JSON database architecture and micro-product engine designed to continuously build, validate, and maintain daily software utility projects while keeping your **GitHub Contribution Grid active and green every single day**.

---

## 🌟 Core Architecture & Features

### 1. 📂 Modular Directory Structure
* **`/db` Directory**: File-based JSON database storing system configurations, daily roadmap logs, table schemas, and dynamic product tables.
* **`/products` Directory**: Standalone operational micro-products folder starting with `/products/01-adblocker-extension`.
* **`/app` Directory**: Modern React 18, TypeScript, Tailwind CSS control panel UI.
* **`/dashboard` Directory**: Python FastAPI backend server providing REST API endpoints, JSON DB CRUD, and git commit automation.

### 2. 🗃️ File-Based JSON Database (`/db`)
* **`db/daily_roadmap.json`**: Tracks `current_streak_days`, `active_project`, and structured daily logs (`day`, `date`, `project`, `phase`, `today_done`, `tomorrow_plan`, `status`, `github_commit_hash`).
* **`db/system_config.json`**: Stores system settings and streak goals.
* **`db/[table]_schema.json`**: Strict column definitions supporting data types (`number`, `string`, `boolean`, `datetime`, `json`) and constraints (`required`, `min`, `max`, `default`, `pattern`).
* **`db/[table].json`**: Dynamic data tables (e.g. `db/adblocker_rules.json`).

### 3. 🛡️ Strict Data Type Validation Layer
* **Dynamic Form Generator**: UI input fields auto-generated from `db/[table]_schema.json`.
* **Client & Server-Side Validator**: Validates numbers, booleans, and regex patterns before file writes. Displays a Red Alert Toast on constraint violations.
* **Schema Manager**: Add/Drop columns and configure constraints with auto git commits (`db(schema): ...` & `db(data): ...`).

### 4. 🧩 Micro-Product 01: Manifest V3 AdBlocker Extension (`/products/01-adblocker-extension`)
* **Manifest V3 Extension**: Complete browser extension source (`manifest.json`, `background.js`, `rules.json`, `content.js`, `popup.html`).
* **Dynamic Rule Sync**: Rule table in `db/adblocker_rules.json` automatically syncs with `rules.json` for declarative net request blocking.

---

## 🛠️ Tech Stack & Setup

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
* **Backend**: Python FastAPI, Uvicorn, Pydantic data validation.
* **Database**: File-based JSON Database Engine (`/db`).
* **Deployment**: Render (Backend & Static Assets).

### Run Locally:
```bash
# 1. Run FastAPI Backend Server
uvicorn dashboard.server:app --reload --port 8000

# 2. Build Frontend UI
cd app && npm run build
```

---

## 📝 GitHub Streak Maintenance & Commit Conventions

When you click **"Save & Commit Daily Progress"** in the dashboard, the engine updates `db/daily_roadmap.json`, stages files with `git add`, and creates structured git commits:
* `feat(build): Day X - ...` for build phase updates
* `docs(plan): Day X - ...` for planning phase updates
* `db(schema): ...` for database schema modifications
* `db(data): ...` for validated data row insertions

---

© 2026 DailyCode Engine. Built for Daily Routine Productivity & GitHub Streak Automation.
