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
│       ├── deploy-netlify-new.yml   # Auto-creates Netlify sites for new apps
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
  "url": "https://aisle-my-app.netlify.app",
  "folder": "my-app",
  "tags": ["utility"]
}
```

- **`folder`** maps to a directory under `apps/`.
- **`url`** is the live Netlify URL. Omitting it triggers automatic deployment (see below).
- The `-launcher` entry represents the landing page itself (base URL of the whole project).

### apps/ Directory

Every subdirectory under `apps/` is an independent app. Apps must be fully self-contained — no shared code between them. The `-launcher` subdirectory is special: it's the landing page that reads `apps.json` and renders links to all other apps.

### Netlify Deployment

Each app (including `-launcher`) is deployed as a **separate Netlify site**. The Netlify site's "Base directory" is set to the app's folder (e.g. `apps/my-app`). The `netlify.toml` inside each app folder controls the build settings and only triggers a rebuild when that specific directory changes.

The `-launcher` Netlify site (the landing page) fetches `apps.json` live from the GitHub raw URL via a proxy redirect in its `netlify.toml`.

### Adding a New App

1. Create `apps/<app-name>/index.html` and `apps/<app-name>/netlify.toml`.
2. Add an entry to `apps.json` **without** a `url` field.
3. Push to `main` — the `deploy-netlify-new` action auto-creates the Netlify site and writes the URL back to `apps.json`.

See `AGENTS.md` for full instructions and file templates.
