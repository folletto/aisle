# How to create a new app

## Guidelines

* Each app must be self-contained with no dependencies on other apps.
* Make apps mobile-friendly, responsive
* If a build system isn't specified, use React Router v7 in framework mode and have components with their own css
* If icons are needed, use the Lucide icon set

## How to

1. Create a new folder in /apps/ with a descriptive kebab-case name. If the user hasn't explicitly provided this, ask and provide a suggestion based on the request
2. Include AGENTS.md file and keep it updated with a short explanation of how the app works
3. Include netlify.toml to configure Netlify as needed
4. Add an entry to the `apps.json` at the repo root (follow the same structure). Leave `siteId` and `url` empty — the CI setup job will automatically create the Netlify container and fill these in.

## Deployment

* The app will auto-deploy (auto-preview on PR, auto-deploy on merge to main), no need to take any special action unless asked explicitly

## Structure

* Include error handling and edge cases
* For apps with a build system, add tests
* Add comments in the code to explain complex logic (i.e. at the top of a complex code file)
* Test before committing
* Keep the code clean and maintainable
* If a build system with components is used, create components where possible
* Test the app works before committing
