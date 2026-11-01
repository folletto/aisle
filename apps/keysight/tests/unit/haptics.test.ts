import { afterEach, describe, expect, it, vi } from 'vitest';
import { hapticPress, hapticRelease } from '../../src/haptics';

afterEach(() => vi.unstubAllGlobals());

describe('haptics', () => {
  it('vibrates long enough to feel when the Vibration API exists', () => {
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { vibrate });
    hapticPress();
    expect(vibrate).toHaveBeenCalledWith(20);
  });
  it('does not tick again on release when the Vibration API handled the press', () => {
    const create = vi.spyOn(document, 'createElement');
    vi.stubGlobal('navigator', { vibrate: vi.fn() });
    hapticRelease();
    expect(create).not.toHaveBeenCalledWith('label');
    create.mockRestore();
  });
  it('ticks the iOS switch on release when there is no Vibration API, and not on press', () => {
    vi.stubGlobal('navigator', {});
    hapticPress();
    expect(document.querySelector('input[switch]')).toBeNull();
    hapticRelease();
    expect(document.querySelector('input[switch]')).not.toBeNull();
  });
  it('never throws when nothing is supported', () => {
    vi.stubGlobal('navigator', {});
    expect(() => { hapticPress(); hapticRelease(); }).not.toThrow();
  });
});
