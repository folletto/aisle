# Hello World Mini-App

A simple demonstration app showing the structure and capabilities of the Mini-Apps monorepo.

## Features

- Responsive design
- Interactive emoji that changes on click
- Clean, modern UI with gradient background
- Information boxes explaining the project structure

## Local Development

Simply open `index.html` in your browser. No build step required!

## Deployment

This app is configured to deploy to Netlify automatically when changes are pushed to GitHub.

### Netlify Configuration

In your Netlify dashboard:
1. Create a new site
2. Link to your GitHub repository
3. Set **Base directory** to: `apps/hello-world`
4. Build settings are automatically read from `netlify.toml`

The app will only rebuild when files in this directory change, thanks to the `build.ignore` setting in `netlify.toml`.
