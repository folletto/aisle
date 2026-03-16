# Aisle

A monorepo for personal mini web apps, mostly LLM-coded.

— 🚀 [Open Aisle](https://aisle.intenseminimalism.com/)


## What is it

This repository is meant to be used in conjunction with a coding agent (i.e. Claude Code). The idea is to be able to open the agent, build a new app from scratch, push as PR on GitHub, and boom getting it deployed.

It works also on fully mobile build flows: Claude Code → PR → GitHub Mobile → test and merge.


## Make it yours

The repository logic (.agents, .github) is under a MIT license, with the exception of each of the apps, as they would need specific reviews.

This means you can clone / fork this repository, remove the apps, and make it yours.

To make it work you need:
* GitHub (of course)
* An agent that can connect and work directly with GitHub (i.e. Claude Code)
* A Netlify account and these in GitHub secrets: `NETLIFY_ACCOUNT_SLUG`, `NETLIFY_AUTH_TOKEN`, `NETLIFY_GITHUB_INSTALLATION_ID`, `NETLIFY_TEAM_ID`.


## Structure overview

This repository is meant to be used primarily via an LLM.
* The agents instructions exist in AGENTS.md and .agents/ folder, make sure your LLM is picking them up.
* Each mini app lives in its own apps/ subfolder, and it's meant to be isolated (no sharing with anything else in the repository) and is deployed in its own container.
* GitHub Actions deal with CI (preview in PRs, and deployment).
