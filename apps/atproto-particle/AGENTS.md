# AT Particle

A Bluesky/AT Protocol timeline reader that groups posts by author and shows you the most relevant content from each person in discrete time windows throughout the day.

## How It Works

### Time Windows
Users define "moments" throughout the day (e.g., 9:00 AM, 12:00 PM, 8:00 PM). The app determines the current snapshot window based on the current time and fetches posts from that window.

### Post Processing
1. Fetches timeline posts within the current time window via the AT Protocol API
2. Groups posts by author (DID)
3. Sorts authors alphabetically by display name/handle
4. Selects each author's "top post" by: most quotes+reposts > most replies > most likes

### Architecture
- **Client-side only** React Router v7 app
- **UpdateEngine** (`/app/engine/`) is decoupled from React for future extraction to a Node.js cron job
- **SettingsDb** (`/app/db/`) abstracts localStorage behind a database-like interface

## Tech Stack
- React Router v7 (framework mode, SPA)
- TypeScript
- `@atproto/api` for Bluesky integration
- CSS Modules for styling
- Vitest + React Testing Library for tests
- Lucide React for icons
