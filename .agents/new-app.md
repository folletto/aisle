# How to create a new app

## Guidelines

* Each app must be self-contained with no dependencies on other apps.
* Make apps mobile-friendly, responsive
* If a build system isn't specified, use React Router v7 in framework mode and have components with their own css
* If needed, use the Lucide icon set

## How to

1. Create a new folder in /apps/ with a descriptive kebab-case name. If the user hasn't explicitly provided this, ask and provide a suggestion based on the request
2. Include AGENTS.md file and keep it updated with a short explanation of how the app works
3. Include netlify.toml to configure Netlify as needed (see templates below)
4. Add an entry to the `apps.json` at the repo root (follow the same structure)

## netlify.toml

The deploy workflow (`deploy.yml`) runs `netlify deploy` from inside each app's directory. The Netlify CLI triggers its full Build system whenever it finds a `[build]` section with a `command` — even when deploying pre-built files. This fails for trivial commands (echo, etc.) and causes unnecessary double-builds for npm apps.

**Rule: never use `[build]` for static sites. Only use it for apps that genuinely require an npm build.**

### Static site (HTML/CSS/JS, no build step)

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

The workflow defaults to deploying `.` with no build step when `[build]` is absent.

### Build app (React Router v7 / Remix / etc.)

```toml
[build]
  publish = "build/client"
  command = "npm ci && npm run build"

[build.environment]
  NODE_VERSION = "22"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The workflow reads `publish` and `command` from `[build]` to run the build locally, then passes `--dir` to the CLI. Adjust `publish` if your framework outputs to a different directory.

## Deployment

* The app will auto-deploy (auto-preview on PR, auto-deploy on merge to main), no need to take any special action unless asked explicitly
