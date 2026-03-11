import type { TimeInterval, TimeWindow } from "~/types";

/**
 * Sort intervals chronologically by time of day.
 */
export function sortIntervals(intervals: TimeInterval[]): TimeInterval[] {
  return [...intervals].sort((a, b) => {
    if (a.hour !== b.hour) return a.hour - b.hour;
    return a.minute - b.minute;
  });
}

/**
 * Convert a TimeInterval to minutes since midnight.
 */
function toMinutes(interval: TimeInterval): number {
  return interval.hour * 60 + interval.minute;
}

/**
 * Format a TimeInterval as a human-readable string (e.g., "9:00 AM").
 */
export function formatInterval(interval: TimeInterval): string {
  const h = interval.hour % 12 || 12;
  const m = interval.minute.toString().padStart(2, "0");
  const ampm = interval.hour < 12 ? "AM" : "PM";
  return `${h}:${m} ${ampm}`;
}

/**
 * Given a set of time intervals and the current time, determine the
 * snapshot window: the time range of posts to fetch.
 *
 * Logic:
 * - Find the latest interval that has already passed ("completed moment").
 * - The window starts at the interval before that one and ends at the completed moment.
 * - If the current time is before all intervals, use the last interval from the previous day.
 */
export function resolveTimeWindow(
  intervals: TimeInterval[],
  now: Date = new Date()
): TimeWindow {
  if (intervals.length === 0) {
    throw new Error("At least one interval is required");
  }

  const sorted = sortIntervals(intervals);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  // Find index of the latest completed interval (one that's already passed)
  let completedIndex = -1;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (toMinutes(sorted[i]) <= nowMinutes) {
      completedIndex = i;
      break;
    }
  }

  const today = new Date(now);
  today.setSeconds(0, 0);

  if (completedIndex === -1) {
    // Current time is before all intervals today.
    // The latest completed moment is the last interval from yesterday.
    const endInterval = sorted[sorted.length - 1];
    const startInterval = sorted.length > 1 ? sorted[sorted.length - 2] : sorted[sorted.length - 1];

    const end = new Date(today);
    end.setDate(end.getDate() - 1);
    end.setHours(endInterval.hour, endInterval.minute, 0, 0);

    const start = new Date(today);
    // If start interval is >= end interval, it's the same day
    // If start interval < end interval, it's the same day (yesterday)
    if (sorted.length > 1) {
      start.setDate(start.getDate() - 1);
      start.setHours(startInterval.hour, startInterval.minute, 0, 0);
    } else {
      // Only one interval: window is the full 24h before it
      start.setDate(start.getDate() - 2);
      start.setHours(startInterval.hour, startInterval.minute, 0, 0);
    }

    return { start, end };
  }

  // Build the end time from the completed interval
  const endInterval = sorted[completedIndex];
  const end = new Date(today);
  end.setHours(endInterval.hour, endInterval.minute, 0, 0);

  // The start is the interval before the completed one
  let start: Date;
  if (completedIndex === 0) {
    // Wrap around to last interval from yesterday
    const startInterval = sorted[sorted.length - 1];
    start = new Date(today);
    start.setDate(start.getDate() - 1);
    start.setHours(startInterval.hour, startInterval.minute, 0, 0);
  } else {
    const startInterval = sorted[completedIndex - 1];
    start = new Date(today);
    start.setHours(startInterval.hour, startInterval.minute, 0, 0);
  }

  return { start, end };
}

/**
 * Find the next upcoming interval from now.
 */
export function getNextInterval(
  intervals: TimeInterval[],
  now: Date = new Date()
): { interval: TimeInterval; date: Date } {
  const sorted = sortIntervals(intervals);
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const interval of sorted) {
    if (toMinutes(interval) > nowMinutes) {
      const date = new Date(now);
      date.setHours(interval.hour, interval.minute, 0, 0);
      return { interval, date };
    }
  }

  // All intervals passed today; next is first interval tomorrow
  const interval = sorted[0];
  const date = new Date(now);
  date.setDate(date.getDate() + 1);
  date.setHours(interval.hour, interval.minute, 0, 0);
  return { interval, date };
}
