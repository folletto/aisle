import { Note } from '../core/notes';

/** One normalised key press, whatever the source. */
export interface KeyPress {
  note: Note;
  midi: number;
  source: 'touch' | 'keyboard';
  timestamp: number;
}
