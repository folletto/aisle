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

* Create a new app: [new-app.md](.agents/new-app.md)


## Tips for AI Agents

- GitHub commit messages should use the format "{app name}: {change}" when they refer to an app, and "Actions: {message}" when they change the GitHub Actions.
- Always create fully functional, production-ready apps
- Include error handling and edge cases
- Add helpful comments for complex logic
- Test the app works before committing
- Keep the code clean and maintainable
- Componentize where possible

---

## App: Particle (`apps/atproto-particle`)

A Bluesky/AT Protocol timeline reader that distils your feed into discrete time-window snapshots, grouped by author.

### Key concepts

- **Time windows** – The day is divided into named intervals (default: 9 AM, 12 PM, 8 PM). `resolveTimeWindow` picks the latest *completed* window given the current time. Users can navigate back/forward across windows with chevron buttons (bounded by 24 h ago and the latest completed window).
- **Snapshot** – One time window's worth of data. Each snapshot is fetched once and persisted to `localStorage` (keyed by `start|end` ISO strings). Explicit refresh invalidates only the current window.
- **Author aggregation** – Original posts (no replies, no reshares) are grouped by author DID. Each author's top post is selected by engagement rank (`quotes+reposts > replies > likes`).

### Architecture layers

```
routes/          ← React Router pages (SPA, SSR disabled)
  _index.tsx     ← Orchestrates load / cache / navigation state
  settings.tsx   ← User settings (intervals, credentials)
  login.tsx      ← AT Protocol credential entry
  debug.tsx      ← Raw markdown debug report

components/      ← Presentational React components (CSS Modules)
  Header         ← App title, time-window badge, chevron nav, refresh
  TabBar         ← Snapshot / Reshares / Notifications tabs with counters
  MainList       ← Switches between tab content + footer stats
  AggregatedCard ← Author card with top post, metrics, embeds
  ReshareCard    ← Reshared post with "Reshared by" attribution
  NotificationCard ← Notification item (like, repost, follow, mention…)
  EmbedView      ← Renders AT Protocol embed types (images, external link,
                   quoted post, video, recordWithMedia)

engine/          ← Pure business logic, no React deps
  updateEngine.ts  ← Fetches timeline pages, filters, aggregates, ranks
  timeWindows.ts   ← Window maths: resolve, prev, next, format

db/              ← localStorage abstractions
  snapshotCache.ts ← Per-window cache map (get/set/remove/clearAll)
  settingsDb.ts    ← User settings persistence

context/
  AuthContext.tsx  ← AT Protocol session (BskyAgent), login/logout

debug/           ← Developer tooling
  debugStore.ts    ← In-memory store of last fetch (raw posts, snapshot…)
  consoleApi.ts    ← Exposes window.atp.{raw,snapshot,status,help} in console
  generateReport.ts ← Builds a markdown debug report for copy-paste sharing

utils/
  linkify.tsx    ← Turns URLs in post text into <a> elements
  postLink.ts    ← Converts AT URI + handle → bsky.app URL

types/index.ts   ← Shared TypeScript interfaces
```

### Data flow (main feed load)

1. `_index.tsx` → `resolveTimeWindow(intervals)` → determines current window
2. `snapshotCache.get(window)` → cache hit? render immediately
3. Cache miss → `updateEngine.getSnapshot(window, onProgress)` (parallel: timeline + notifications)
4. Results stored in `snapshotCache.set(window, data)` and in React state
5. `Header` shows time range + chevrons; `TabBar` shows per-tab counters; `MainList` renders the active tab

### Tech stack

| Concern | Choice |
|---|---|
| Framework | React Router v7 (SPA mode) |
| AT Protocol | `@atproto/api` (`BskyAgent`) |
| Icons | `lucide-react` |
| Styling | CSS Modules |
| Tests | Vitest + Testing Library |
| Deploy | Netlify (Node 22, `build/client`) |
