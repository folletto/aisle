// Haptic tick on key press, where the browser / device supports it.
//  - Android Chrome: navigator.vibrate.
//  - iOS Safari 17.4+ has no Vibration API, but toggling a hidden <input type="checkbox" switch>
//    inside a user gesture gives a light haptic tick (best effort, may not fire from every event).
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

export function hapticTick(): void {
  if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
    navigator.vibrate(10);
  } else {
    iosTick();
  }
}
