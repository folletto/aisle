import { describe, it, expect } from "vitest";
import {
  resolveTimeWindow,
  sortIntervals,
  formatInterval,
  getNextInterval,
} from "./timeWindows";
import type { TimeInterval } from "~/types";

const intervals: TimeInterval[] = [
  { hour: 9, minute: 0 },
  { hour: 12, minute: 0 },
  { hour: 20, minute: 0 },
];

describe("sortIntervals", () => {
  it("sorts intervals chronologically", () => {
    const unsorted: TimeInterval[] = [
      { hour: 20, minute: 0 },
      { hour: 9, minute: 0 },
      { hour: 12, minute: 0 },
    ];
    expect(sortIntervals(unsorted)).toEqual([
      { hour: 9, minute: 0 },
      { hour: 12, minute: 0 },
      { hour: 20, minute: 0 },
    ]);
  });
});

describe("formatInterval", () => {
  it("formats AM times", () => {
    expect(formatInterval({ hour: 9, minute: 0 })).toBe("9:00 AM");
  });

  it("formats PM times", () => {
    expect(formatInterval({ hour: 20, minute: 0 })).toBe("8:00 PM");
  });

  it("formats noon", () => {
    expect(formatInterval({ hour: 12, minute: 0 })).toBe("12:00 PM");
  });

  it("formats midnight as 12:00 AM", () => {
    expect(formatInterval({ hour: 0, minute: 0 })).toBe("12:00 AM");
  });
});

describe("resolveTimeWindow", () => {
  it("returns 8pm-9am window when current time is 11am", () => {
    // At 11am, the latest completed moment is 9am
    // The start is the previous interval: 8pm yesterday
    const now = new Date("2025-03-15T11:00:00");
    const window = resolveTimeWindow(intervals, now);

    expect(window.end.getHours()).toBe(9);
    expect(window.end.getMinutes()).toBe(0);
    expect(window.start.getHours()).toBe(20);
    expect(window.start.getMinutes()).toBe(0);
    // Start should be the day before
    expect(window.start.getDate()).toBe(now.getDate() - 1);
  });

  it("returns 9am-12pm window when current time is 12:01pm", () => {
    const now = new Date("2025-03-15T12:01:00");
    const window = resolveTimeWindow(intervals, now);

    expect(window.end.getHours()).toBe(12);
    expect(window.end.getMinutes()).toBe(0);
    expect(window.start.getHours()).toBe(9);
    expect(window.start.getMinutes()).toBe(0);
    expect(window.start.getDate()).toBe(now.getDate());
  });

  it("returns 12pm-8pm window when current time is 9pm", () => {
    const now = new Date("2025-03-15T21:00:00");
    const window = resolveTimeWindow(intervals, now);

    expect(window.end.getHours()).toBe(20);
    expect(window.end.getMinutes()).toBe(0);
    expect(window.start.getHours()).toBe(12);
    expect(window.start.getMinutes()).toBe(0);
  });

  it("wraps to yesterday when current time is before all intervals", () => {
    const now = new Date("2025-03-15T07:00:00");
    const window = resolveTimeWindow(intervals, now);

    // Latest completed = last interval yesterday (8pm)
    expect(window.end.getHours()).toBe(20);
    expect(window.end.getDate()).toBe(14); // yesterday
    expect(window.start.getHours()).toBe(12);
    expect(window.start.getDate()).toBe(14);
  });

  it("throws with empty intervals", () => {
    expect(() => resolveTimeWindow([])).toThrow(
      "At least one interval is required"
    );
  });
});

describe("getNextInterval", () => {
  it("returns next interval today when available", () => {
    const now = new Date("2025-03-15T10:00:00");
    const result = getNextInterval(intervals, now);
    expect(result.interval).toEqual({ hour: 12, minute: 0 });
    expect(result.date.getDate()).toBe(15);
  });

  it("returns first interval tomorrow when all have passed", () => {
    const now = new Date("2025-03-15T21:00:00");
    const result = getNextInterval(intervals, now);
    expect(result.interval).toEqual({ hour: 9, minute: 0 });
    expect(result.date.getDate()).toBe(16);
  });
});
