import logging
from typing import Dict, Optional

import requests

from automation import config

logger = logging.getLogger(__name__)

_API = "https://api.netlify.com/api/v1"


class NetlifyManager:
    def __init__(self) -> None:
        self._headers = {
            "Authorization": f"Bearer {config.NETLIFY_TOKEN}",
            "Content-Type": "application/json",
        }

    def create_site_from_repo(
        self, repo_name: str, site_name: str, github_username: str
    ) -> Dict:
        """Create a Netlify site linked to a GitHub repo. Returns site info dict."""
        payload = {
            "name": site_name,
            "repo": {
                "provider": "github",
                "repo": f"{github_username}/{repo_name}",
                "branch": "main",
                "cmd": "npm run build",
                "dir": "dist",
            },
        }
        resp = requests.post(
            f"{_API}/sites", json=payload, headers=self._headers, timeout=30
        )
        resp.raise_for_status()
        site = resp.json()
        url = site.get("ssl_url") or site.get("url", "")
        logger.info("Netlify site created: %s → %s", site["id"], url)
        return {
            "site_id": site["id"],
            "url": url,
            "admin_url": site.get("admin_url", ""),
        }

    def get_deploy_status(self, site_id: str) -> Dict:
        """Return the latest deploy's state and URL."""
        resp = requests.get(
            f"{_API}/sites/{site_id}/deploys",
            headers=self._headers,
            params={"per_page": 1},
            timeout=10,
        )
        resp.raise_for_status()
        deploys = resp.json()
        if not deploys:
            return {"state": "no_deploys", "url": ""}
        d = deploys[0]
        return {
            "state": d.get("state", "unknown"),
            "url": d.get("deploy_ssl_url") or d.get("deploy_url", ""),
            "created_at": d.get("created_at", ""),
        }

    def trigger_deploy(self, site_id: str) -> Optional[str]:
        """Manually trigger a build. Returns the build ID or None."""
        resp = requests.post(
            f"{_API}/sites/{site_id}/builds",
            headers=self._headers,
            timeout=10,
        )
        resp.raise_for_status()
        return resp.json().get("id")
