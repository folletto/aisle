# GitHub Actions

This repository uses two GitHub Actions workflows, both located under `.github/workflows/`.

---

## deploy-netlify-new.yml — Auto-Deploy New Apps

**Trigger:** Push to `main` when `apps.json` changes.

**Purpose:** Automatically creates a Netlify site for any app in `apps.json` that does not yet have a `url` field, then writes the generated URL back to `apps.json`.

**How it works:**

1. **Find undeployed apps** — Reads `apps.json` with `jq` and collects entries where `url` is null or empty.
2. **Fetch GitHub App installation ID** — Calls the Netlify API to get the GitHub App installation ID linked to the Netlify account (needed for repo-connected deployments).
3. **Create Netlify sites** — For each undeployed app folder:
   - Verifies the folder exists under `apps/`.
   - Creates a Netlify site named `aisle-<folder>` via the Netlify API, with the base directory set to `apps/<folder>`.
   - Captures the generated `ssl_url`.
4. **Update apps.json** — Writes the live URL back into the matching entry in `apps.json`.
5. **Commit and push** — Commits the updated `apps.json` as `github-actions[bot]` with `[skip ci]` to avoid re-triggering the workflow.

**Required secrets:**
| Secret | Description |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Personal access token for the Netlify account |
| `NETLIFY_TEAM_ID` | Netlify team/account slug |
| `GITHUB_TOKEN` | Provided automatically by GitHub Actions |

**Permissions:** `contents: write` (to push the updated `apps.json`).

---

## check-cross-app.yml — Cross-App Change Warning

**Trigger:** Pull requests targeting `main` (opened, synchronized, or reopened).

**Purpose:** Detects when a PR modifies files across more than one app directory and adds a warning comment to the PR.

**How it works:**

1. Uses `actions/github-script` to call the GitHub API and list all files changed in the PR.
2. Extracts the app folder name from each changed file path that matches `apps/<folder>/...`.
3. If two or more distinct app folders are affected, checks whether a warning comment already exists (to avoid duplicates).
4. If no warning has been posted yet, posts the comment:

   > ⚠️ This PR changes files across the app boundary

**Permissions:** `contents: read`, `pull-requests: write` (to post comments).

**Why this matters:** Apps in this repo are meant to be independent. A PR that touches multiple apps at once could indicate unintended coupling or a mistake. The warning is informational — it does not block merging.
