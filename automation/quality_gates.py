import subprocess
import logging
from pathlib import Path
import os
import sys

logger = logging.getLogger(__name__)
ROOT_DIR = Path(__file__).resolve().parent.parent
APP_DIR = ROOT_DIR / "app"

def run_command_in_app(args: list[str]) -> tuple[bool, str]:
    """Runs a shell command in the app directory, returning success and output."""
    try:
        logger.info("Executing quality gate command: %s", " ".join(args))
        # Use shell=True only on Windows for .cmd/.bat resolving compatibility
        is_win = (sys.platform == "win32")
        
        # Limit Node memory ceiling to fit within Render 512MB RAM limit
        env = os.environ.copy()
        env["NODE_OPTIONS"] = "--max-old-space-size=400"
        
        result = subprocess.run(
            args,
            cwd=str(APP_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            shell=is_win,
            env=env,
            timeout=300 # 5 minutes max timeout
        )
        output = f"STDOUT:\n{result.stdout}\nSTDERR:\n{result.stderr}"
        if result.returncode == 0:
            return True, output
        else:
            logger.warning("Command '%s' failed with exit code %d", " ".join(args), result.returncode)
            return False, output
    except Exception as e:
        logger.error("Exception running quality gate command '%s': %s", " ".join(args), e)
        return False, str(e)

def verify_build(files_written: list[str]) -> tuple[bool, str]:
    """
    Quality Gates verification sequence:
    1. If package.json written or node_modules missing, run 'npm install'
    2. Run TypeScript compilation (if script or tsc config exists)
    3. Run npm run build
    """
    # Bypass compilation quality gates in low-memory cloud hosts (e.g. Render 512MB RAM)
    if os.environ.get("SKIP_COMPILATION_GATES") == "true":
        logger.info("SKIP_COMPILATION_GATES is active. Skipping heavy npm install/build compilation checks on Render.")
        return True, "Compilation skipped due to low-memory environment setting."

    APP_DIR.mkdir(parents=True, exist_ok=True)
    
    # 1. Install dependencies if needed
    has_package_json = (APP_DIR / "package.json").exists()
    node_modules_exists = (APP_DIR / "node_modules").exists()
    
    if has_package_json:
        is_package_json_modified = any("package.json" in f for f in files_written)
        if is_package_json_modified or not node_modules_exists:
            logger.info("Running npm install...")
            success, output = run_command_in_app(["npm", "install", "--no-audit", "--no-fund", "--loglevel=error"])
            if not success:
                return False, f"npm install failed:\n{output}"

    # 2. Check TypeScript compile
    # Check if there is a compile/tsc target or tsconfig.json exists
    if (APP_DIR / "tsconfig.json").exists():
        logger.info("Running TypeScript compilation check...")
        # Check package.json to see if 'compile' or 'build' script is defined
        compile_success, compile_output = run_command_in_app(["npx", "tsc", "--noEmit"])
        if not compile_success:
            return False, f"TypeScript Compilation failed:\n{compile_output}"

    # 3. Check build bundler
    if has_package_json:
        # Check package.json for build script
        try:
            with open(APP_DIR / "package.json", "r", encoding="utf-8") as f:
                pkg = f.read()
                if '"build":' in pkg:
                    logger.info("Running build verification check...")
                    build_success, build_output = run_command_in_app(["npm", "run", "build"])
                    if not build_success:
                        return False, f"Build bundling failed:\n{build_output}"
        except Exception as e:
            logger.warning("Could not read package.json for build verification: %s", e)

    logger.info("All Quality Gates passed successfully!")
    return True, ""
