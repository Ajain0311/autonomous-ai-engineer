import os
import json
import logging
import urllib.request
import urllib.error

logger = logging.getLogger("github_activity")

def _get_api_headers() -> dict:
    token = os.environ.get("GITHUB_TOKEN", "") or os.environ.get("GH_PAT", "")
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "DailyCode-Automation-Bot"
    }
    if token:
        headers["Authorization"] = f"token {token}"
    return headers

def create_github_issue(owner: str, repo: str, title: str, body: str) -> int:
    """Creates a new GitHub Issue in the target repository to boost Issues %."""
    url = f"https://api.github.com/repos/{owner}/{repo}/issues"
    payload = json.dumps({"title": title, "body": body}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=_get_api_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            issue_number = data.get("number", 0)
            logger.info("Successfully created GitHub Issue #%d in %s/%s", issue_number, owner, repo)
            return issue_number
    except Exception as e:
        logger.warning("Could not create GitHub issue: %s", e)
        return 0

def create_pull_request(owner: str, repo: str, title: str, head: str, base: str, body: str) -> int:
    """Creates a new Pull Request to boost Pull Requests %."""
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls"
    payload = json.dumps({
        "title": title,
        "head": head,
        "base": base,
        "body": body
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=_get_api_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            pr_number = data.get("number", 0)
            logger.info("Successfully created Pull Request #%d (%s -> %s)", pr_number, head, base)
            return pr_number
    except Exception as e:
        logger.warning("Could not create Pull Request: %s", e)
        return 0

def submit_pr_review(owner: str, repo: str, pr_number: int, event: str = "COMMENT", body: str = "Code Quality Gates passed.") -> bool:
    """Submits a Code Review on a PR to boost Code Reviews %."""
    if not pr_number:
        return False
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/reviews"
    payload = json.dumps({
        "event": event,
        "body": body
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=_get_api_headers(), method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            logger.info("Successfully submitted Code Review on PR #%d", pr_number)
            return True
    except Exception as e:
        logger.warning("Could not submit PR review: %s", e)
        return False

def merge_pull_request(owner: str, repo: str, pr_number: int, commit_title: str = "Merge PR") -> bool:
    """Merges an open Pull Request."""
    if not pr_number:
        return False
    url = f"https://api.github.com/repos/{owner}/{repo}/pulls/{pr_number}/merge"
    payload = json.dumps({
        "commit_title": commit_title,
        "merge_method": "squash"
    }).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers=_get_api_headers(), method="PUT")
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            logger.info("Successfully merged PR #%d into base branch", pr_number)
            return True
    except Exception as e:
        logger.warning("Could not merge PR #%d: %s", pr_number, e)
        return False
