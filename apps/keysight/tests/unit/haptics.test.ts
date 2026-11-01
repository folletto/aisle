import { afterEach, describe, expect, it, vi } from 'vitest';
import { attachIosHaptic, hapticPress } from '../../src/haptics';

afterEach(() => vi.unstubAllGlobals());

/** label > (switch, host with a shadow root holding a .key and a .pan), like ks-play-view around ks-piano. */
function setup(shouldTick: (e: Event) => boolean) {
  const label = document.createElement('label');
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  const host = document.createElement('div');
  const shadow = host.attachShadow({ mode: 'open' });
  shadow.innerHTML = '<div class="pan"></div><div class="key"></div>';
  label.append(input, host);
  document.body.append(label);
  const cleanup = attachIosHaptic(label, shouldTick);
  const tap = (cls: string) =>
    shadow.querySelector(cls)!.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, cancelable: true }));
  return { input, tap, cleanup, label };
}
const onKey = (e: Event) => e.composedPath().some((n) => n instanceof Element && n.classList.contains('key'));

describe('haptics', () => {
  it('vibrates for 30 ms when the Vibration API exists', () => {
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { vibrate });
    hapticPress();
    expect(vibrate).toHaveBeenCalledWith(30);
  });
  it('does nothing on press without the Vibration API, and never throws', () => {
    vi.stubGlobal('navigator', {});
    expect(() => hapticPress()).not.toThrow();
  });
  it('a tap on a key lets the click through to the switch', () => {
    const { tap, label } = setup(onKey);
    const spy = vi.fn();
    label.addEventListener('click', spy);
    tap('.key');
    expect(spy).toHaveBeenCalledTimes(1); // forwarded click on the switch does not bubble back
    label.remove();
  });
  it('cancels the click when no tick is wanted (pan strip, haptics off)', () => {
    const { label } = setup(onKey);
    const ev = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true });
    label.querySelector('div')!.shadowRoot!.querySelector('.pan')!.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(true);
    label.remove();
  });
  it('removes its listeners on cleanup', () => {
    const { cleanup, label } = setup(() => false);
    cleanup();
    const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
    label.dispatchEvent(ev);
    expect(ev.defaultPrevented).toBe(false);
    label.remove();
  });
});
