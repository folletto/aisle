// Haptic tick on key press, where the browser / device supports it.
//  - Android Chrome: navigator.vibrate, fired on press. 10 ms is too short to feel on many phones, so use 20 ms.
//  - iOS Safari 17.4+ has no Vibration API, but toggling a hidden <input type="checkbox" switch>
//    gives a light haptic tick. WebKit only does that inside a user-activation event, and for touch a
//    pointerdown is not one (pointerup, click and touchend are), so the tick is fired on release.
// Silently does nothing when neither is available.

let switchLabel: HTMLLabelElement | null = null;

function iosTick(): void {
  try {
    if (!switchLabel) {
      switchLabel = document.createElement('label');
      switchLabel.setAttribute('aria-hidden', 'true');
      switchLabel.style.cssText = 'position:fixed;left:-100px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.setAttribute('switch', '');
      input.tabIndex = -1;
      switchLabel.appendChild(input);
      document.body.appendChild(switchLabel);
    }
    switchLabel.click();
  } catch {
    /* ignore */
  }
}

export const VIBRATE_MS = 20;

export function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

/** Call on press. Vibrates where the Vibration API exists; does nothing otherwise (see hapticRelease). */
export function hapticPress(): void {
  if (canVibrate()) navigator.vibrate(VIBRATE_MS);
}

/** Call on release (inside pointerup). The iOS switch tick; skipped when the Vibration API already handled the press. */
export function hapticRelease(): void {
  if (!canVibrate()) iosTick();
}
