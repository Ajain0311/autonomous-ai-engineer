import logging
from typing import Dict, List

import requests
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)

_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; DailyCodeBot/1.0)"
}


def _get_github_trending() -> List[Dict]:
    try:
        resp = requests.get(
            "https://github.com/trending?since=daily",
            headers=_HEADERS,
            timeout=15,
        )
        resp.raise_for_status()
    except requests.RequestException as exc:
        logger.warning("GitHub trending fetch failed: %s", exc)
        return []

    soup = BeautifulSoup(resp.text, "html.parser")
    repos = []
    for article in soup.select("article.Box-row")[:12]:
        name_el = article.select_one("h2 a")
        desc_el = article.select_one("p.col-9")
        lang_el = article.select_one("[itemprop='programmingLanguage']")
        stars_el = article.select_one("a.Link--muted[href$='/stargazers']")
        if not name_el:
            continue
        repos.append({
            "name": name_el.get_text(separator="", strip=True),
            "description": desc_el.get_text(strip=True) if desc_el else "",
            "language": lang_el.get_text(strip=True) if lang_el else "",
            "stars": stars_el.get_text(strip=True) if stars_el else "0",
            "source": "github_trending",
        })
    logger.info("GitHub trending: found %d repos", len(repos))
    return repos


def _get_hackernews_top() -> List[Dict]:
    try:
        ids = requests.get(
            "https://hacker-news.firebaseio.com/v0/topstories.json",
            timeout=10,
        ).json()[:25]
    except Exception as exc:
        logger.warning("HackerNews fetch failed: %s", exc)
        return []

    stories: List[Dict] = []
    for sid in ids:
        try:
            item = requests.get(
                f"https://hacker-news.firebaseio.com/v0/item/{sid}.json",
                timeout=5,
            ).json()
            if item and item.get("type") == "story":
                stories.append({
                    "name": item.get("title", ""),
                    "description": item.get("title", ""),
                    "score": item.get("score", 0),
                    "source": "hackernews",
                })
        except Exception:
            continue

    top = sorted(stories, key=lambda x: x["score"], reverse=True)[:8]
    logger.info("HackerNews: found %d top stories", len(top))
    return top


def get_trending_topics() -> Dict:
    """Return aggregated trending data from GitHub and HackerNews."""
    return {
        "github_trending": _get_github_trending(),
        "hackernews": _get_hackernews_top(),
    }
