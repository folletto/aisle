# Git structure

## Commit messages

Use the following structure in writing of commit messages:
{type}({mini app}): {description}
For example:
feat(tfl-status): Added filtering feature based on line status

{mini app} is defined as:
* If the changes are primarily regarding an app, use the name of the folder containing the app
* If the changes are primarily regarding the special app "-launcher" use "home"
* If about the overall repository, don't use it so just {type}: description (i.e. docs: updated readme)

{type} is defined as:
* feat: a new feature
* fix: a bug fix
* docs: documentation only changes
* build: code change that affect the build system 
* ci: code change to our CI configuration files and scripts
* perf: code change that improves performance
* refactor: code change that neither fixes a bug nor adds a feature
* style: code change that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
* test: code change affecting tests, adding missing tests or correcting existing tests


## PR messages
Set the title of the PR as: [{mini app}] {description}
The description should follow this template (the part inside code quotes, replace as described):
```
{Short description of the main change in 1-2 sentences}

Key changes
{Bullet point describing in short sentences what was changed / added / fixed)

Explanation
{Bullet points that explains the decision made, what changed, and the logic, this can be as short or as long as needed depending on the change}

```
