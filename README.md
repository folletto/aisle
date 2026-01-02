# Aisle

A monorepo for LLM-made ("vibe coded") personal mini web apps.  
→ [Open apps](https://the-aisle.netlify.app/)


## 🎯 Overview

This project allows you to create, manage, and deploy multiple mini-apps from a single repository. Each app:
- Lives in its own directory
- Deploys independently to Netlify
- Only rebuilds when its files change
- Is accessible from a central landing page

## 📁 Project Structure

```
mini-apps/
├── apps/                    # Individual mini-apps
│   └── [your-app]/         # Your apps here
│       ├── index.html
│       ├── netlify.toml
│       └── ...
├── landing-page/           # Central portal
│   ├── index.html          # Main landing page
│   ├── apps.json           # App registry
│   └── netlify.toml
├── CLAUDE.md               # Instructions for Claude Code
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mini-apps
```

### 2. Set Up Netlify Deployment

#### For the Landing Page:
1. Log in to [Netlify](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - **Base directory**: `landing-page`
   - **Build command**: (leave empty, uses netlify.toml)
   - **Publish directory**: (leave empty, uses netlify.toml)
5. Deploy!

#### For Each Mini-App:
Repeat for each app in `/apps/`:
1. Create a new Netlify site
2. Connect to the same GitHub repository
3. Configure build settings:
   - **Base directory**: `apps/<app-name>`
   - **Build command**: (leave empty, uses netlify.toml)
   - **Publish directory**: (leave empty, uses netlify.toml)
4. Deploy!

### 3. Update App URLs

After deploying, update `landing-page/apps.json` with the actual Netlify URLs:

```json
{
  "apps": [
    {
      "name": "My App",
      "description": "Description of your app",
      "url": "https://your-app.netlify.app",
      "folder": "my-app",
      "tags": ["utility", "tool"]
    }
  ]
}
```

Commit and push the changes - the landing page will automatically update!

## 🛠️ Creating a New Mini-App

### Using Claude Code

The easiest way to create a new app is with Claude Code:

1. Tell Claude: "Create a new mini-app called [app-name] that does [functionality]"
2. Claude will:
   - Create the app directory in `/apps/`
   - Generate all necessary files (HTML, CSS, JS, netlify.toml)
   - Update the landing page configuration
3. Commit and push the changes
4. Set up the Netlify site (see step 2 above)

See [CLAUDE.md](./CLAUDE.md) for detailed instructions that Claude Code follows.

### Manual Creation

1. Create a new directory in `/apps/`:
   ```bash
   mkdir apps/my-new-app
   cd apps/my-new-app
   ```

2. Create required files:
   - `index.html` - Your app's HTML
   - `netlify.toml` - Netlify configuration (copy from template in CLAUDE.md)

3. Update `landing-page/apps.json`:
   ```json
   {
     "apps": [
       {
         "name": "My New App",
         "description": "What your app does",
         "url": "https://my-new-app.netlify.app",
         "folder": "my-new-app",
         "tags": ["utility", "tool"]
       }
     ]
   }
   ```

4. Commit, push, and deploy to Netlify

## 📋 App Guidelines

Each app should:
- ✅ Be self-contained (no dependencies on other apps)
- ✅ Work without a build step (or include build instructions)
- ✅ Be responsive and mobile-friendly
- ✅ Include proper meta tags and descriptions
- ✅ Have a link back to the landing page
- ✅ Follow accessibility best practices

Keep it simple:
- Prefer vanilla HTML/CSS/JavaScript
- Use CDN links for external libraries if needed
- Optimize for fast loading and good UX

## 🔄 Deployment Workflow

1. **Make changes** to an app or create a new one
2. **Commit and push** to GitHub
3. **Netlify auto-deploys** only the changed apps
4. **Landing page updates** automatically if apps.json changed

The `build.ignore` setting in each `netlify.toml` ensures apps only rebuild when their specific directory changes.

## 🌟 Example Apps

Check out the deployed apps at the [landing page](https://the-aisle.netlify.app/).

## 📝 Configuration Files

### netlify.toml Template

Each app needs a `netlify.toml`:

```toml
[build]
  publish = "."
  command = "echo 'Static site - no build needed'"
  # Only rebuild if this app's directory changed
  ignore = "git diff --quiet HEAD^ HEAD ."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### apps.json Schema

```json
{
  "apps": [
    {
      "name": "string",          // Display name
      "description": "string",   // Short description
      "url": "string",           // Deployed URL
      "folder": "string",        // Folder name in /apps/
      "tags": ["string"]         // Categories/tags
    }
  ]
}
```

## 🤝 Contributing

1. Create a new branch for your app
2. Follow the app guidelines above
3. Test locally before deploying
4. Submit a pull request with your new app

## 📚 Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [CLAUDE.md](./CLAUDE.md) - Detailed instructions for Claude Code

## 📄 License

MIT - Feel free to use this structure for your own mini-apps collection!

## 🙋 Support

For issues or questions:
- Check [CLAUDE.md](./CLAUDE.md) for detailed instructions
- Open an issue on GitHub

---

**Built with Claude Code** | A flexible monorepo structure for independent mini-apps
