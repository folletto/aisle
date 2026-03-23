# Mini-Apps Repository

This is a monorepo for independent web-based mini-apps, each deployed to its own Netlify container.


## Project Structure

Each app is self-contained in its own `apps/` subfolder. The `apps/-launcher` is the "launcher" or "home" app, and it's special as it's the home to access all the other apps.

```
mini-apps/
├── .agents/                # Agents detailed instructions for specific tasks
│   └──  ...
├── .github/
│   └── workflows/          # CI and automation workflows for the repository
├── apps/
│   ├── -launcher/          # launcher special app
│   │   ├── netlify.toml
│   │   └── ... 
│   ├── app-name-1/
│   │   ├── netlify.toml
│   │   └── ... 
│   └── app-name-2/
│       ├── netlify.toml
│       └── ...
├── apps.json               # Configuration of all apps (source of truth)
├── AGENTS.md               # Instruction for LLM agents
└── README.md               # Human-facing documentation
```

## How to

* When the user asks to create a new app: [new-app.md](.agents/new-app.md)
* When the user asks to work on GitHub workflows: [github-actions.md](.agents/github-actions.md)
* When the task requires running git commants / using GitHub: [git.md](.agents/git.md)


## Managing agent MD files

* Update this file when new how tos are added in the .agents/ folder, with a clear indication on when to use it
* Update this file only if any of the existing sections needs an update
* Make sure that each app has its own AGENTS.md file in its own folder


