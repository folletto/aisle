# KeySight

Mobile-first PWA for piano sight-reading training. A note appears on a single staff; the user presses the matching key on the on-screen piano (touch) or the computer keyboard. Spec: "KeySight Piano Training web app spec c1" (Craft).

## Stack

Vite + TypeScript, native Web Components (Custom Elements + Shadow DOM, no UI framework), VexFlow 5 (`vexflow/bravura`, font bundled), Dexie (IndexedDB), vite-plugin-pwa, Vitest. This deviates from the repo default (React Router) on purpose: the spec asks for no framework. Icons are Lucide (`lucide`).

## Commands

* `npm run dev` / `npm run build` / `npm test`
* Netlify builds with `npm ci && npm run build`, publishes `dist/`, SPA fallback redirect in `netlify.toml`.

## Layout

* `src/core`: pure logic, no DOM. `notes` (model, midi, labels), `pool` (note pools, clef ranges, seeded RNG), `settings` (defaults, validation), `session` (engine, driven by `tick(now)` for a fake clock), `keyboard` (key-fit / pinch maths).
* `src/input`: `KeyPress` event bus plus the computer keyboard map (Z X C V B N M = C..B, S D / G H J = black keys, `,` `.` or arrows shift octave).
* `src/data`: Dexie db + `storage.ts`, the only module that touches IndexedDB. Sessions and key events are written in one transaction only when a session completes.
* `src/components/ks-score`: standalone score (VexFlow). Imports nothing from the rest of the app except pure note helpers. API: `clear`, `showNote`, `enqueue`, `judge`, `start`, `stop`; events `ks-note-missed`, `ks-note-cleared`.
* `src/components/ks-piano`: on-screen keyboard (integer white-key window, pinch to resize, pan strip on top, hidden-key counts for the warning badge; tapping a badge calls `fitAll()` to fit the whole range on screen).
* `src/components/ks-*-view`, `ks-app`, `ks-tabbar`, `ks-results`: shell and views. `src/router`: History API router (`/play`, `/settings`, `/stats`).

## Behaviour decisions (spec assumptions)

* Scoring: a target is correct only if answered with no wrong press before it. Wrong presses are logged, not subtracted. A timed note reaching the clef counts as failed.
* "Start with a scale" (setting `scaleStart`) is on by default; its notes count towards the score.
* Note labels: `showLabels` (none, under note, on key, both; default under note) picks where names appear, `labels` picks the format (Do Re Mi, C D E, both). The format control is disabled when showLabels is none. Old stored settings (`labels: 'none'`, `pianoLabels`) are migrated in `normaliseSettings`. `matchLabel` shows the name on a correctly matched note (score attribute `match-labels`); it is forced on and disabled in Settings when labels show under the note.
* Haptics (`src/haptics.ts`): Android uses `navigator.vibrate(30)` on press. iOS 26.5+ only ticks for a real, trusted tap on a `<label>` tied to a `<input type=checkbox switch>` (a script calling `label.click()` was patched out, WebKit 313638@main), so `ks-piano` sits inside such a label in `ks-play-view` (`attachIosHaptic`); quick single-finger taps tick on release, holds, chords and drags do not. Toggle in Settings, on by default. Needs a real device to verify.
* Key sound (`src/sound.ts`): Web Audio triangle-wave note per press (touch and computer keyboard, via the input bus), no audio files. Toggle in Settings, off by default.
* Stop, leaving the Play tab, or backgrounding the page aborts the session and saves nothing.
* i18n (`src/i18n.ts`): English, French, Italian, no library. Add new keys to `en` first (TypeScript forces fr and it). First run picks the browser language if supported, else English. Language dropdown is at the bottom of Settings. Solfege is localised (French writes Ré) via the `locale` attribute on ks-score / ks-piano.
* Streak: shown under the clef from 2 up as a gold ★ (text presentation) plus number; the session record stores `bestStreak` (absent on older sessions). Stats shows the longest streak ever on top and the best per session in the latest list.
* Stats tab (`core/stats.ts`, `ks-stats-view`): last 7 and 30 day averages and the 5 latest scores. Windows are calendar days anchored on the day of the most recent session, not today. The average is pooled (all notes hit / all notes asked), not a mean of session percentages.

## Testing

* `npm test`: unit tests for core, input map and data layer (fake-indexeddb). Component and end-to-end tests from the spec (WebKit, Playwright) are not set up yet; rendering was checked manually with Chromium.
