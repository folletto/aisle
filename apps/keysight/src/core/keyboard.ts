// On-screen keyboard maths: white key window, fitting, pinch.
import { Note, isBlackKey, midiOf } from './notes';

/** Keyboard covers C2..C7 (white keys only are indexed). */
export const FIRST_MIDI = 36;
export const LAST_MIDI = 96;
export const WHITE_MIDIS: number[] = Array.from({ length: LAST_MIDI - FIRST_MIDI + 1 }, (_, i) => FIRST_MIDI + i).filter(
  (m) => !isBlackKey(m),
);

export const MIN_VISIBLE = 5;
export const MIN_KEY_PX = 18;
export const COMFY_KEY_PX = 36;

export function whiteIndex(midi: number): number {
  return WHITE_MIDIS.indexOf(midi);
}

/** Largest number of white keys that still leaves keys MIN_KEY_PX wide. */
export function maxVisible(widthPx: number): number {
  return Math.max(MIN_VISIBLE, Math.min(WHITE_MIDIS.length, Math.floor(widthPx / MIN_KEY_PX)));
}

export function clampVisible(n: number, widthPx: number): number {
  return Math.min(maxVisible(widthPx), Math.max(MIN_VISIBLE, Math.round(n)));
}

/** Integer number of white keys to show by default: the range, within comfortable key width. */
export function defaultVisible(rangeWhiteCount: number, widthPx: number): number {
  return clampVisible(Math.min(rangeWhiteCount, Math.floor(widthPx / COMFY_KEY_PX)), widthPx);
}

export function clampStart(start: number, visible: number): number {
  return Math.min(WHITE_MIDIS.length - visible, Math.max(0, Math.round(start)));
}

/** Start index so the range sits in the middle of `visible` keys. */
export function centredStart(low: Note, high: Note, visible: number): number {
  const lo = whiteIndex(snapWhite(midiOf(low)));
  const hi = whiteIndex(snapWhite(midiOf(high)));
  return clampStart((lo + hi + 1) / 2 - visible / 2, visible);
}

function snapWhite(midi: number): number {
  return isBlackKey(midi) ? midi - 1 : midi;
}

/** Pinch: spreading fingers (ratio > 1) shows fewer, bigger keys. */
export function pinchVisible(startVisible: number, ratio: number, widthPx: number): number {
  return clampVisible(startVisible / ratio, widthPx);
}

/** Range white keys that are scrolled off screen on each side. */
export function hiddenCounts(low: Note, high: Note, start: number, visible: number): { left: number; right: number } {
  const lo = whiteIndex(snapWhite(midiOf(low)));
  const hi = whiteIndex(snapWhite(midiOf(high)));
  const left = Math.max(0, Math.min(hi + 1, start) - lo);
  const right = Math.max(0, hi - Math.max(lo - 1, start + visible - 1));
  return { left, right };
}
