import { debugStore } from "./debugStore";
import { formatInterval } from "~/engine/timeWindows";

function formatTime(iso: string): string {
  if (!iso) return "??";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function sortByTime<T extends { createdAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

const api = {
  /** List the last N raw posts fetched from the API, sorted by time (newest first). */
  raw(n = 10) {
    const { rawPosts } = debugStore.get();
    if (rawPosts.length === 0) {
      console.log("No raw posts stored yet. Load the timeline first.");
      return;
    }
    const sorted = sortByTime(rawPosts).slice(0, n);
    console.table(
      sorted.map((p) => ({
        time: formatTime(p.createdAt),
        author: p.authorDisplayName,
        handle: `@${p.authorHandle}`,
        text: p.text.slice(0, 80) + (p.text.length > 80 ? "..." : ""),
        repost: p.isRepost ? "yes" : "",
        replies: p.replies,
        reposts: p.reposts,
        likes: p.likes,
      }))
    );
    console.log(`Showing ${sorted.length} of ${rawPosts.length} total raw posts.`);
  },

  /** List the last N posts from the aggregated snapshot, sorted by time (newest first). */
  snapshot(n = 10) {
    const { snapshot } = debugStore.get();
    if (snapshot.length === 0) {
      console.log("No snapshot data yet. Load the timeline first.");
      return;
    }
    const withTime = snapshot.map((a) => ({
      ...a,
      createdAt: a.topPost.createdAt,
    }));
    const sorted = sortByTime(withTime).slice(0, n);
    console.table(
      sorted.map((a) => ({
        time: formatTime(a.createdAt),
        author: a.displayName,
        handle: `@${a.handle}`,
        text: a.topPost.text.slice(0, 80) + (a.topPost.text.length > 80 ? "..." : ""),
        posts: a.totalPostsInWindow,
        replies: a.topPost.metrics.replies,
        reposts: a.topPost.metrics.reposts,
        likes: a.topPost.metrics.likes,
      }))
    );
    console.log(`Showing ${sorted.length} of ${snapshot.length} total authors.`);
  },

  /** Show current debug state overview. */
  status() {
    const s = debugStore.get();
    const win = s.window;
    console.log(
      "%cAT Particle Debug",
      "font-weight:bold; font-size:14px"
    );
    console.log(`  Session:     ${s.sessionHandle ?? "(not logged in)"}`);
    console.log(`  Intervals:   ${s.intervals.map(formatInterval).join(", ") || "(none)"}`);
    console.log(`  Window:      ${win ? `${win.start.toLocaleString()} → ${win.end.toLocaleString()}` : "(none)"}`);
    console.log(`  Raw posts:   ${s.totalRawFetched} (${s.pagesLoaded} pages)`);
    console.log(`  Snapshot:    ${s.snapshot.length} authors`);
    console.log(`  Fetched at:  ${s.fetchedAt ?? "(never)"}`);
  },

  /** Print help. */
  help() {
    printHelp();
  },
};

function printHelp() {
  console.log(
    "%cAT Particle Console API",
    "font-weight:bold; font-size:14px; color:#1185fe"
  );
  console.log(
    `%cAvailable commands (type %catp.command()%c):`,
    "color:inherit",
    "font-weight:bold; color:#1185fe",
    "color:inherit"
  );
  console.log(`  atp.raw(n)       List last n raw posts (default 10), newest first`);
  console.log(`  atp.snapshot(n)   List last n snapshot authors (default 10), newest first`);
  console.log(`  atp.status()      Show session, window, and fetch info`);
  console.log(`  atp.help()        Show this help message`);
}

export function initConsoleApi() {
  (window as any).atp = api;
  printHelp();
}
