# Repository Structure

**Aisle** is a monorepo for independent, self-contained mini web apps. Each app lives in its own directory, deploys to its own Netlify site, and is listed in a central registry.

## Directory Layout

```
aisle/
├── .agents/                  # Documentation for AI agents
│   ├── structure.md          # This file — repo overview
│   └── github-actions.md     # How the GitHub Actions work
├── .github/
│   └── workflows/
│       ├── netlify.yml              # CI: provisions containers + deploys apps
│       ├── netlify-status.yml       # Manual audit of deployment status
│       └── check-cross-app.yml      # Warns when a PR touches multiple apps
├── apps/                     # All mini-apps (including the launcher)
│   ├── -launcher/            # The central landing page / app gallery
│   │   ├── index.html
│   │   └── netlify.toml
│   ├── cal-pick-to-share/    # Example app
│   │   ├── index.html
│   │   └── netlify.toml
│   └── [your-app]/           # New apps go here
│       ├── index.html
│       └── netlify.toml
├── apps.json                 # Single source of truth for all app metadata
├── AGENTS.md                 # Instructions for AI agents creating new apps
└── README.md                 # Human-facing project documentation
```

## Key Concepts

### apps.json — Central Registry

`apps.json` at the repo root is the single source of truth for all apps. Each entry looks like:

```json
{
  "name": "My App",
  "description": "What it does",
  "folder": "my-app",
  "url": "https://aisle-my-app.netlify.app",
  "siteId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "tags": ["utility"]
}
```

- **`folder`** maps to a directory under `apps/`.
- **`siteId`** is the Netlify site UUID. Omitting it signals CI to create a new Netlify container.
- **`url`** is the live Netlify URL (set automatically alongside `siteId`).
- **`deleted`** (optional) — set to `true` to mark an app as removed.
- The `-launcher` entry represents the landing page itself (base URL of the whole project).

### apps/ Directory

Every subdirectory under `apps/` is an independent app. Apps must be fully self-contained — no shared code between them. The `-launcher` subdirectory is special: it's the landing page that reads `apps.json` and renders links to all other apps.

### Netlify Deployment

Each app (including `-launcher`) is deployed as a **separate Netlify site**. The Netlify site's "Base directory" is set to the app's folder (e.g. `apps/my-app`). The `netlify.toml` inside each app folder controls the build settings and only triggers a rebuild when that specific directory changes.

The `-launcher` Netlify site (the landing page) fetches `apps.json` live from the GitHub raw URL via a proxy redirect in its `netlify.toml`.

### Adding a New App

1. Create `apps/<app-name>/` with at least an `index.html` (or full app) and `netlify.toml`.
2. Add an entry to `apps.json` **without** `siteId` or `url` fields.
3. Open a PR or push to `main` — the `netlify.yml` setup job auto-creates the Netlify container and writes `siteId` and `url` back to `apps.json`, then the deploy job deploys the app.

See `AGENTS.md` and `.agents/new-app.md` for full instructions and file templates.
