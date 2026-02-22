# Mini-Apps Project

This is a monorepo for independent web-based mini-apps, each deployed to its own Netlify container.

## Project Structure

```
mini-apps/
├── apps/
│   ├── app-name-1/
│   │   ├── index.html
│   │   ├── netlify.toml
│   │   └── ... (any other assets)
│   ├── app-name-2/
│   │   ├── index.html
│   │   ├── netlify.toml
│   │   └── ...
├── landing-page/
│   ├── index.html          # Links to all apps
│   └── netlify.toml
├── apps.json               # Configuration of all apps (source of truth)
├── AGENTS.md               # This file
└── README.md
```

## Creating a New Mini-App

When asked to create a new mini-app, follow these steps:

### 1. Create App Directory
Create a new folder in `/apps/` with a descriptive kebab-case name:
```bash
mkdir -p apps/<app-name>
```

### 2. Required Files

Each app must be **self-contained** with no dependencies on other apps.

**Minimum required files:**
- `index.html` - The main HTML file
- `netlify.toml` - Netlify configuration

**Optional files:**
- `style.css` - Styles (or use inline styles)
- `script.js` - JavaScript (or use inline scripts)
- `README.md` - App-specific documentation
- Any other assets (images, fonts, etc.)

### 3. netlify.toml Template

Copy this template for each new app's `netlify.toml`:

```toml
[build]
  publish = "."
  command = "echo 'Static site - no build needed'"
  # Only rebuild if this app's directory changed
  ignore = "git diff --quiet $CACHED_COMMIT_REF $COMMIT_REF ."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### 4. HTML Template

Use this as a starting template for `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="[App description]">
    <title>[App Name]</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            padding: 2rem;
            max-width: 800px;
            margin: 0 auto;
        }
        /* Add app-specific styles here */
    </style>
</head>
<body>
    <header>
        <h1>[App Name]</h1>
        <p>[App description]</p>
    </header>

    <main>
        <!-- App content here -->
    </main>

    <footer style="margin-top: 3rem; padding-top: 1rem; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 0.9rem;">
        <a href="/">← Back to all apps</a>
    </footer>

    <script>
        // App JavaScript here
    </script>
</body>
</html>
```

### 5. Register the App

After creating the app files, add an entry to `/apps.json` at the repo root **without a `url` field**:

```json
{
  "apps": [
    {
      "name": "App Name",
      "description": "Brief description",
      "folder": "app-name",
      "tags": ["utility", "tool"]
    }
  ]
}
```

The `deploy-netlify-new` GitHub Action will automatically detect the missing `url`, create a Netlify site named `aisle-<folder>` (e.g. `https://aisle-app-name.netlify.app`), and write the URL back to `apps.json`. The landing page will then display the new app.

## Development Guidelines

### Self-Contained Apps
- Each app should work independently
- No shared code between apps (copy if needed)
- Include all assets within the app folder

### Keep It Simple
- Prefer vanilla HTML/CSS/JavaScript
- Only use external libraries if absolutely necessary
- Use CDN links for any external dependencies

### Responsive Design
- Make apps mobile-friendly
- Use viewport meta tag
- Test on different screen sizes

### Accessibility
- Use semantic HTML
- Include proper ARIA labels
- Ensure keyboard navigation works

## Netlify Deployment

Each app is deployed as a separate Netlify site, automatically via the `deploy-netlify-new` GitHub Action:

1. Add entry to `apps.json` (no `url` field)
2. Create the `apps/<app-name>` directory with required files
3. Push to `main` — the action creates the Netlify site with `aisle-<app-name>` as the project name and writes the URL back to `apps.json`

The landing page is a separate Netlify site with base directory `landing-page`. It reads `apps.json` via a proxy redirect.

## Tips for AI Agents

- Always create fully functional, production-ready apps
- Include error handling and edge cases
- Add helpful comments for complex logic
- Test the app works before committing
- Keep the code clean and maintainable
- Follow the HTML template structure for consistency
