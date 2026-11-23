#!/usr/bin/env bash
# One-time setup: creates the GitHub repo, turns on GitHub Pages (Actions source), pushes the code.
# After this, every push to main is tested and deployed automatically.
# Usage: ./scripts/setup-github.sh [repo-name]
set -euo pipefail
REPO="${1:-cv-maker}"
command -v gh >/dev/null || { echo "Install the GitHub CLI first: https://cli.github.com"; exit 1; }
gh auth status >/dev/null || { echo "Run 'gh auth login' first."; exit 1; }
[ -d .git ] || git init -b main
git add -A
git commit -m "Initial commit" || true
git branch -M main
OWNER="$(gh api user -q .login)"
gh repo create "$REPO" --public --source=. --remote=origin
gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 \
  || gh api -X PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null
git push -u origin main
echo
echo "Done. First deploy takes about 2 minutes:"
echo "  Site:    https://$OWNER.github.io/$REPO/"
echo "  Actions: https://github.com/$OWNER/$REPO/actions"
