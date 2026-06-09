# daily-code

Fully automated pipeline that finds trending project ideas, generates React+TypeScript apps with Gemini, commits incremental improvements daily, and deploys to Netlify — zero manual intervention.

## How it works

```
GitHub Actions (daily cron)
        │
        ▼
  trend_finder.py      ← scrapes GitHub Trending + HackerNews
        │
        ▼
  project_planner.py   ← Gemini plans a 10-task project (or picks next task)
        │
        ▼
  project_planner.py   ← Gemini generates production React+TS code
        │
        ▼
  github_manager.py    ← commits files to the project's own repo
        │
        ▼
  netlify_manager.py   ← Netlify auto-deploys on every push
        │
        ▼
  progress_tracker.py  ← state.json updated; pushed back to this repo
```

Each daily run executes one task. After ~10 days the project is complete, a new trending idea is chosen, and the cycle restarts.

## Setup

### 1. Clone and install

```bash
git clone https://github.com/<you>/daily-code
cd daily-code
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
```

### 2. Required secrets (GitHub → Settings → Secrets)

| Secret | Description |
|--------|-------------|
| `GH_PAT` | GitHub Personal Access Token — scopes: `repo`, `workflow` |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/app/apikey) |
| `GITHUB_USERNAME` | Your GitHub username |
| `NETLIFY_TOKEN` | *(optional)* Netlify personal access token |

### 3. Optional variable

| Variable | Default | Description |
|----------|---------|-------------|
| `GEMINI_MODEL` | `gemini-1.5-pro` | Any Gemini model name |

### 4. Enable the workflow

The schedule (`0 9 * * *` = 09:00 UTC) activates automatically once secrets are set.
To trigger manually: **Actions → Daily Code Generation → Run workflow**.

## Local run

```bash
python automation/orchestrator.py
```

State is persisted to `automation/state.json`.

## Project structure

```
automation/
├── config.py          # env vars + validate()
├── trend_finder.py    # GitHub Trending + HackerNews scraper
├── project_planner.py # Gemini: project planning + code generation
├── github_manager.py  # GitHub API (create repo, commit files)
├── netlify_manager.py # Netlify API (create site, deploy status)
├── progress_tracker.py# state.json read/write helpers
├── orchestrator.py    # main entry point
├── state.json         # persisted run state (auto-generated)
└── logs/              # per-run log files

.github/workflows/
├── daily-automation.yml  # scheduled daily run
└── pr-checks.yml         # state.json validation + Python lint
```

## Generated projects

Projects land in their own repos (`github.com/<you>/<project-name>`) with:
- React 18 + TypeScript + Vite + Tailwind CSS
- Zustand state management
- React Router v6
- Vitest unit tests
- ESLint + Prettier
- Netlify auto-deploy (`netlify.toml` included in every scaffold)
