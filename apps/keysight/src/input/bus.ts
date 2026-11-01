import { KeyPress } from './types';

/** Tiny event bus: the one stream of KeyPress events the session listens to. */
export class InputBus {
  private listeners = new Set<(kp: KeyPress) => void>();
  onPress(fn: (kp: KeyPress) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  emit(kp: KeyPress): void {
    this.listeners.forEach((fn) => fn(kp));
  }
}
