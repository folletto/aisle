// Haptic tick on key press, where the browser / device supports it.
//  - Android Chrome: navigator.vibrate, fired on press.
//  - iOS Safari has no Vibration API. Toggling a <input type="checkbox" switch> gives a light haptic tick,
//    but since iOS 26.5 WebKit only allows it for trusted events: a script calling label.click() no longer
//    works (WebKit 313638@main). The real tap has to land on a <label> tied to the switch, so the piano
//    sits inside such a label (see attachIosHaptic) and the tick happens on release of a quick tap.
// Silently does nothing when neither is available.

export const VIBRATE_MS = 30;

export function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** Call on press. Vibrates where the Vibration API exists; does nothing otherwise. */
export function hapticPress(): void {
  if (canVibrate()) navigator.vibrate(VIBRATE_MS);
}

/**
 * iOS: make taps inside `label` toggle the hidden switch it contains, which gives the haptic tick.
 * `shouldTick` decides per tap; when it says no, the click is cancelled so the switch does not toggle.
 * Returns a cleanup function.
 */
export function attachIosHaptic(label: HTMLLabelElement, shouldTick: (e: Event) => boolean): () => void {
  const input = label.querySelector<HTMLInputElement>('input[type="checkbox"]');
  if (!input) return () => {};
  // The click forwarded to the switch must not bubble back to the label.
  const stop = (e: Event) => e.stopPropagation();
  const onLabelClick = (e: Event) => {
    if (!shouldTick(e)) e.preventDefault();
  };
  input.addEventListener('click', stop);
  label.addEventListener('click', onLabelClick);
  return () => {
    input.removeEventListener('click', stop);
    label.removeEventListener('click', onLabelClick);
  };
}
