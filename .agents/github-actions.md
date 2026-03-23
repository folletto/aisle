# GitHub Actions

This repository uses GitHub Actions workflows located under `.github/workflows/`.

---

## netlify.yml — Netlify CI (Setup + Deploy)

**Triggers:**
- Push to `main` when `apps/**` or `apps.json` change → production deploy
- Pull request (opened, synchronize, reopened) when `apps/**` or `apps.json` change → preview deploy
- Manual workflow dispatch → specify apps to deploy

**Purpose:** Two-job workflow that first provisions Netlify containers for new apps, then builds and deploys changed apps.

### Job 1: Setup Netlify Containers

1. **Find unprovisioned apps** — scans `apps.json` for entries without a `siteId` (excluding `deleted` entries).
2. **Create Netlify sites** — uses `netlify sites:create` CLI to provision each missing site with the name `aisle-<folder>`. Falls back to looking up existing sites if the name is already taken.
3. **Update apps.json** — writes the `siteId` and `url` back into apps.json.
4. **Commit and push** — commits as `github-actions[bot]` with message `Bot: Netlify container created for app <name>`.

### Job 2: Build & Deploy

Runs after setup completes. Re-checks out the branch to pick up any commits from setup.

1. **Detect changed apps** — determines which apps need deployment:
   - For push to main: diffs the previous commit against current
   - For PRs: diffs against the base branch
   - For manual dispatch: uses the provided app list, or "all"
   - Detects both file changes under `apps/<folder>/` and entry-level changes in `apps.json`
2. **Build** — reads `netlify.toml` from each app's folder for the build command and publish directory. Runs the build command if present (skips no-op `echo` placeholders).
3. **Deploy** — uses `netlify deploy` with `--site` pointing to the `siteId` from apps.json.
   - Push to main → production deploy (`--prod`)
   - Pull request → deploy with `--alias=pr-<PR_NUMBER>`, producing a stable URL: `https://pr-<PR_NUMBER>--aisle-<folder>.netlify.app` (same URL across all commits to the PR)
4. **PR comment** — for PRs, creates or updates a single bot comment titled "## Netlify Deploy Preview" with a table of app → preview URL.

**Required secrets:**

| Secret | Description |
|---|---|
| `NETLIFY_AUTH_TOKEN` | Personal access token for the Netlify account |
| `NETLIFY_TEAM_ID` | Netlify team/account slug (used for site creation) |

**Permissions:** `contents: write` (commit apps.json), `pull-requests: write` (post comments).

---

## netlify-status.yml — 🕹️ Netlify Deployment Status

**Trigger:** Manual workflow dispatch only.

**Purpose:** Audits all app entries in `apps.json` and categorises their deployment status into four states:

| Status | Meaning |
|---|---|
| ✅ Deployed | Folder exists in repo AND Netlify container is reachable |
| ⚠️ Unlinked | Folder exists in repo BUT no Netlify container (missing siteId or site unreachable) |
| 🗑️ Orphaned | Marked as deleted BUT Netlify container still exists (needs cleanup) |
| 🏁 Cleaned up | Marked as deleted AND no Netlify container (fully removed) |

Results are written to the GitHub Actions step summary for easy reading.

**Required secrets:** `NETLIFY_AUTH_TOKEN`

**Permissions:** `contents: read`

---

## check-cross-app.yml — Cross-App Change Warning

**Trigger:** Pull requests targeting `main` (opened, synchronized, or reopened).

**Purpose:** Warns when a PR modifies files across more than one app directory. Posts a single comment:

> ⚠️ This PR changes files across the app boundary

**Permissions:** `contents: read`, `pull-requests: write`

---

## disable-netlify-autobuild.yml — 🕹️ Netlify: Disable Bot Auto-Publishing

**Trigger:** Manual workflow dispatch only.

**Purpose:** One-time utility to disable Netlify Bot auto-publishing on all sites. After running, all deployments go through the `netlify.yml` workflow instead.

**Required secrets:** `NETLIFY_AUTH_TOKEN`

---

## apps.json Schema

Each app entry in `apps.json` supports these fields:

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Human-readable app name |
| `description` | Yes | Short description |
| `folder` | Yes | Directory name under `apps/` |
| `url` | Auto | Live Netlify URL (set by setup job) |
| `siteId` | Auto | Netlify site ID (set by setup job) |
| `tags` | Yes | Array of tag strings |
| `deleted` | No | Set to `true` to mark an app as deleted |
