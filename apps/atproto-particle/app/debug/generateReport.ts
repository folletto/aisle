import { debugStore } from "./debugStore";
import { formatInterval } from "~/engine/timeWindows";

function fmtDate(d: Date | null): string {
  if (!d) return "(none)";
  return d.toLocaleString();
}

export function generateDebugReport(): string {
  const s = debugStore.get();
  const lines: string[] = [];

  lines.push("# Particle Debug Report");
  lines.push("");
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push("");

  // Session
  lines.push("## Session");
  lines.push("");
  lines.push(`- Handle: ${s.sessionHandle ?? "(not logged in)"}`);
  lines.push(`- Fetched at: ${s.fetchedAt ?? "(never)"}`);
  lines.push("");

  // Settings
  lines.push("## Settings");
  lines.push("");
  lines.push(
    `- Intervals: ${s.intervals.map(formatInterval).join(", ") || "(none)"}`
  );
  lines.push("");

  // Time Window
  lines.push("## Time Window");
  lines.push("");
  if (s.window) {
    lines.push(`- Start: ${s.window.start.toISOString()} (${fmtDate(s.window.start)})`);
    lines.push(`- End: ${s.window.end.toISOString()} (${fmtDate(s.window.end)})`);
  } else {
    lines.push("- (no window resolved)");
  }
  lines.push("");

  // Fetch Stats
  lines.push("## Fetch Stats");
  lines.push("");
  lines.push(`- Pages loaded: ${s.pagesLoaded}`);
  lines.push(`- Total raw posts fetched: ${s.totalRawFetched}`);
  lines.push(`- Posts in window (snapshot authors): ${s.snapshot.length}`);
  lines.push("");

  // Snapshot (aggregated authors)
  lines.push("## Snapshot Authors");
  lines.push("");
  if (s.snapshot.length === 0) {
    lines.push("(empty)");
  } else {
    lines.push("| # | Author | Handle | Top Post | Posts | Replies | Reposts | Quotes | Likes | Time |");
    lines.push("|---|--------|--------|----------|-------|---------|---------|--------|-------|------|");
    s.snapshot.forEach((a, i) => {
      const t = a.topPost;
      const text = t.text.replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 60);
      lines.push(
        `| ${i + 1} | ${a.displayName} | @${a.handle} | ${text} | ${a.totalPostsInWindow} | ${t.metrics.replies} | ${t.metrics.reposts} | ${t.metrics.quotes} | ${t.metrics.likes} | ${t.createdAt ? new Date(t.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "?"} |`
      );
    });
  }
  lines.push("");

  // Raw posts (last 30)
  lines.push("## Raw Posts (last 30)");
  lines.push("");
  if (s.rawPosts.length === 0) {
    lines.push("(empty)");
  } else {
    const sorted = [...s.rawPosts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    lines.push("| # | Time | Author | Handle | Text | Repost | Replies | Reposts | Likes |");
    lines.push("|---|------|--------|--------|------|--------|---------|---------|-------|");
    sorted.slice(0, 30).forEach((p, i) => {
      const text = p.text.replace(/\|/g, "\\|").replace(/\n/g, " ").slice(0, 50);
      const time = p.createdAt
        ? new Date(p.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : "?";
      lines.push(
        `| ${i + 1} | ${time} | ${p.authorDisplayName} | @${p.authorHandle} | ${text} | ${p.isRepost ? "yes" : ""} | ${p.replies} | ${p.reposts} | ${p.likes} |`
      );
    });
  }
  lines.push("");

  return lines.join("\n");
}
