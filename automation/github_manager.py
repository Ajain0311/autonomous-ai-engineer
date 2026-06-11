import logging
from typing import Dict, List

from github import Github, GithubException

from automation import config

logger = logging.getLogger(__name__)


class GitHubManager:
    def __init__(self) -> None:
        self._g = Github(config.GITHUB_TOKEN)
        self._user = self._g.get_user()
        self.username = config.GITHUB_USERNAME or self._user.login

    # ------------------------------------------------------------------
    # Repo management
    # ------------------------------------------------------------------

    def create_repo(self, name: str, description: str) -> str:
        """Create a public repo and return its HTML URL."""
        try:
            repo = self._user.create_repo(
                name=name,
                description=description,
                private=False,
                auto_init=False,
                has_issues=True,
                has_wiki=False,
            )
            logger.info("Created repo: %s", repo.html_url)
            return repo.html_url
        except GithubException as exc:
            if exc.status == 422:  # Already exists
                repo = self._g.get_repo(f"{self.username}/{name}")
                logger.info("Repo already exists: %s", repo.html_url)
                return repo.html_url
            raise

    def repo_exists(self, name: str) -> bool:
        try:
            self._g.get_repo(f"{self.username}/{name}")
            return True
        except GithubException:
            return False

    def get_repo_url(self, name: str) -> str:
        return self._g.get_repo(f"{self.username}/{name}").html_url

    # ------------------------------------------------------------------
    # Git plumbing — commit multiple files atomically
    # ------------------------------------------------------------------

    def commit_files(
        self,
        repo_name: str,
        files: Dict[str, str],
        message: str,
        branch: str = "main",
    ) -> str:
        """Push `files` to `branch` in one commit. Returns the new commit SHA."""
        repo = self._g.get_repo(f"{self.username}/{repo_name}")

        # Resolve current HEAD (if branch exists)
        parent_commit = None
        base_tree = None
        try:
            ref = repo.get_git_ref(f"heads/{branch}")
            parent_commit = repo.get_git_commit(ref.object.sha)
            base_tree = parent_commit.tree
        except GithubException:
            pass  # Empty repo — first commit has no parent

        # Create blobs
        tree_elements: List[Dict] = []
        for path, content in files.items():
            blob = repo.create_git_blob(content=content, encoding="utf-8")
            tree_elements.append(
                {"path": path, "mode": "100644", "type": "blob", "sha": blob.sha}
            )

        # Create tree
        new_tree = (
            repo.create_git_tree(tree_elements, base_tree)
            if base_tree
            else repo.create_git_tree(tree_elements)
        )

        # Create commit
        parents = [parent_commit] if parent_commit else []
        new_commit = repo.create_git_commit(message, new_tree, parents)

        # Advance (or create) the branch ref
        if parent_commit:
            repo.get_git_ref(f"heads/{branch}").edit(sha=new_commit.sha)
        else:
            repo.create_git_ref(f"refs/heads/{branch}", new_commit.sha)

        logger.info(
            "Committed %d file(s) to %s/%s @ %s",
            len(files),
            repo_name,
            branch,
            new_commit.sha[:7],
        )
        return new_commit.sha

    # ------------------------------------------------------------------
    # Pull requests
    # ------------------------------------------------------------------

    def create_pull_request(
        self,
        repo_name: str,
        title: str,
        body: str,
        head: str,
        base: str = "main",
    ) -> str:
        """Open a PR and return its HTML URL."""
        repo = self._g.get_repo(f"{self.username}/{repo_name}")
        pr = repo.create_pull(title=title, body=body, head=head, base=base)
        logger.info("Created PR: %s", pr.html_url)
        return pr.html_url
