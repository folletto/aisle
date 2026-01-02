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
│   ├── netlify.toml
│   └── apps.json           # Configuration of all apps
├── CLAUDE.md               # This file
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

### 5. Update Landing Page

After creating a new app, update `/landing-page/apps.json`:

```json
{
  "apps": [
    {
      "name": "App Name",
      "description": "Brief description",
      "url": "https://app-name.netlify.app",
      "folder": "app-name",
      "tags": ["utility", "tool"]
    }
  ]
}
```

The landing page will automatically display the new app.

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

Each app is deployed as a separate Netlify site:

1. **Create new site** in Netlify dashboard
2. **Link to GitHub** repository
3. **Set base directory** to `apps/<app-name>`
4. **Build settings** are read from app's `netlify.toml`
5. **Auto-deploys** only when that app's files change

The landing page is also a separate Netlify site with base directory `landing-page`.

## Tips for Claude Code

- Always create fully functional, production-ready apps
- Include error handling and edge cases
- Add helpful comments for complex logic
- Test the app works before committing
- Keep the code clean and maintainable
- Follow the HTML template structure for consistency
