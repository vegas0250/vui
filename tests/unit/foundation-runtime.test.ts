import { beforeEach, describe, expect, it } from 'vitest';
import {
  containerBand,
  getTheme,
  getUIMode,
  readFoundation,
  setTheme,
  setUIMode,
} from '../../src/foundation/index';
import type { VuiTheme, VuiUIMode } from '../../src/foundation/index';

const themes: VuiTheme[] = [
  'light',
  'dark',
  'high-contrast',
  'system',
  'neon-green',
  'neon-magenta',
  'neon-cyan',
];
const modes: VuiUIMode[] = ['web', 'desktop', 'terminal'];

describe('foundation runtime', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    document.documentElement.setAttribute('data-vui-theme', 'light');
    document.documentElement.setAttribute('data-vui-ui', 'web');
  });

  it('reads one snapshot of theme, UI mode, tokens, motion, and layers', () => {
    const snapshot = readFoundation();
    expect(snapshot.theme).toBe('light');
    expect(snapshot.uiMode).toBe('web');
    expect(snapshot.density).toBe('web');
    expect(snapshot.tokens).toHaveProperty('--vui-color-background');
    expect(snapshot.tokens).toHaveProperty('--vui-size-control');
    expect(snapshot.motion.duration).toBeTypeOf('string');
    expect(snapshot.layers.dialog).toBeTypeOf('string');
    expect(snapshot.thresholds.narrow).toBeGreaterThan(0);
    expect(snapshot.thresholds.medium).toBeGreaterThan(snapshot.thresholds.narrow);
  });

  it('keeps theme, UI mode, and container band independent', () => {
    for (const theme of themes) {
      for (const mode of modes) {
        setTheme(theme);
        setUIMode(mode);
        const snapshot = readFoundation();
        expect(snapshot.theme).toBe(theme);
        expect(snapshot.uiMode).toBe(mode);
        expect(getTheme()).toBe(theme);
        expect(getUIMode()).toBe(mode);
        expect(containerBand(snapshot.thresholds.narrow)).toBe('narrow');
        expect(containerBand(snapshot.thresholds.narrow + 1)).toBe('medium');
        expect(containerBand(snapshot.thresholds.medium)).toBe('medium');
        expect(containerBand(snapshot.thresholds.medium + 1)).toBe('wide');
      }
    }
  });

  it('reads reduced motion and forced colors from the platform media queries', () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes('reduce') || query.includes('forced-colors'),
      media: query,
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
      onchange: null,
      addListener() {},
      removeListener() {},
    })) as typeof window.matchMedia;
    const snapshot = readFoundation();
    expect(snapshot.reducedMotion).toBe(true);
    expect(snapshot.forcedColors).toBe(true);
    window.matchMedia = original;
  });
});
