# Mini-Apps Repository

This is a monorepo for independent web-based mini-apps, each deployed to its own Netlify container.

## Project Structure

Each app is self-contained in its own `apps/` subfolder. The `apps/-launcher` is the "launcher" or "home" app, and it's special as it's the home to access all the other apps.

```
mini-apps/
├── apps/
│   ├── -launcher/
│   │   ├── netlify.toml
│   │   └── ... 
│   ├── app-name-1/
│   │   ├── netlify.toml
│   │   └── ... 
│   └── app-name-2/
│       ├── netlify.toml
│       └── ...
├── apps.json               # Configuration of all apps (source of truth)
├── AGENTS.md               # This file
└── README.md
```

## How to

* Create a new app: @.agents/new-app.md


## Tips for AI Agents

- GitHub commit messages should use the format "{app name}: {change}" when they refer to an app, and "Actions: {message}" when they change the GitHub Actions.
- Always create fully functional, production-ready apps
- Include error handling and edge cases
- Add helpful comments for complex logic
- Test the app works before committing
- Keep the code clean and maintainable
- Componentize where possible
