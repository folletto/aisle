import { afterEach, describe, expect, it, vi } from 'vitest';
import { hapticTick } from '../../src/haptics';

afterEach(() => vi.unstubAllGlobals());

describe('hapticTick', () => {
  it('vibrates briefly when the Vibration API exists', () => {
    const vibrate = vi.fn();
    vi.stubGlobal('navigator', { vibrate });
    hapticTick();
    expect(vibrate).toHaveBeenCalledWith(10);
  });
  it('never throws when nothing is supported', () => {
    vi.stubGlobal('navigator', {});
    expect(() => hapticTick()).not.toThrow();
  });
});
