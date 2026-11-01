// Pure staff geometry for ks-score. Units are "virtual px" where one staff line gap = LINE_GAP.
// The SVG is drawn in virtual units and scaled to fit the element height.
import { diatonicIndex, parseNote } from '../../core/notes';
import { CLEFS, Clef } from '../../core/pool';

export const LINE_GAP = 10;
const STEM_ROOM = 38; // room above the highest note for its stem
const LABEL_ROOM = 46; // room below the lowest note for ledger lines + label

/** Vertical offset of a note from the top staff line, in virtual px (positive = down). */
export function noteOffsetY(note: { letter: string; octave: number }, clef: Clef): number {
  const top = diatonicIndex(parseNote(CLEFS[clef].topLine));
  const n = diatonicIndex(parseNote(`${note.letter}${note.octave}`));
  return (top - n) * (LINE_GAP / 2);
}

export interface Layout {
  scale: number;
  vw: number; // virtual width
  vh: number; // virtual height
  topLineY: number; // y of top staff line (virtual)
}

export function computeLayout(width: number, height: number, clef: Clef, low: string, high: string): Layout {
  const yHigh = noteOffsetY(parseNote(high), clef);
  const yLow = noteOffsetY(parseNote(low), clef);
  const contentTop = Math.min(0, yHigh) - STEM_ROOM;
  const contentBottom = Math.max(4 * LINE_GAP, yLow) + LABEL_ROOM;
  const content = contentBottom - contentTop;
  const scale = Math.min(2.4, Math.max(0.5, height / content));
  const vh = height / scale;
  const topLineY = (vh - content) / 2 - contentTop;
  return { scale, vw: width / scale, vh, topLineY };
}
