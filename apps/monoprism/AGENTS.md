# Monoprism

A cloud storage folder browser. Start with a URL, sign in, and browse your files in a clean sidebar + file-list layout.

## How It Works

### Routes

| Path | Purpose |
|---|---|
| `/` | Entry redirect — sends to `/setup`, `/login`, or `/browse` |
| `/setup` | URL entry form; validates against registered providers |
| `/login` | Provider sign-in; expects `?folder=ID&provider=NAME` |
| `/browse` | Main file browser; expects `?folder=ID` |
| `/logged-out` | Post-logout screen |

URL design: the folder ID travels as a `?folder=` query param so any `/browse?folder=ID` URL is bookmarkable. Visiting it when not authenticated redirects to `/login?folder=ID` and returns to `/browse?folder=ID` after sign-in.

### Provider System

```
app/providers/
├── types.ts           # StorageProvider interface + shared types (DriveFile, DriveFolder, …)
├── registry.ts        # providers[], detectProvider(url), getProvider(name)
└── google-drive/
    ├── index.ts       # GoogleDriveProvider class
    ├── auth.ts        # GIS token model (OAuth 2.0 implicit flow, in-memory only)
    ├── api.ts         # Drive API v3 REST calls
    └── detector.ts    # URL regex for Google Drive folder links
```

To add a new provider (e.g. Dropbox):
1. Create `app/providers/dropbox/` implementing the `StorageProvider` interface.
2. Add `new DropboxProvider()` to the `providers` array in `registry.ts`.
3. No other files need to change.

### Auth

- Uses **Google Identity Services (GIS)** token model — loaded dynamically via a `<script>` tag.
- Token is stored in React context (memory) only — never in localStorage.
- **Before deploying**: replace `GOOGLE_CLIENT_ID` in `app/providers/google-drive/auth.ts` with a real OAuth 2.0 Web Client ID from Google Cloud Console. Add your Netlify domain to the authorized JavaScript origins.

### Architecture

```
context/
  AppContext.tsx      # provider, token, user — shared across all routes

components/           # Presentational, CSS Modules
  UrlEntry            # URL input + unsupported-source error
  LoginPrompt         # Sign-in button + folder preview
  Toolbar             # Folder name | access count + visibility + user
  Sidebar             # Home tab + root sub-folder tabs
  FileList            # Files + sub-folders + breadcrumb nav
```

## Tech Stack

- React Router v7 (SPA mode, `ssr: false`)
- TypeScript
- CSS Modules
- `lucide-react` for icons
- Netlify deployment
