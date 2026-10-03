import { beforeEach, describe, expect, it } from 'vitest';
import { containerBand, getDensity, getTheme, readFoundation, setDensity, setTheme } from '../../src/foundation/index';
import type { VuiDensity, VuiTheme } from '../../src/foundation/index';

const themes: VuiTheme[] = ['light', 'dark', 'high-contrast', 'system', 'neon-green', 'neon-magenta', 'neon-cyan'];
const densities: VuiDensity[] = ['comfortable', 'compact', 'dense'];

describe('foundation runtime', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    document.documentElement.setAttribute('data-vui-theme', 'light');
    document.documentElement.setAttribute('data-vui-density', 'comfortable');
  });

  it('reads one snapshot of theme, density, tokens, motion, and layers', () => {
    const snapshot = readFoundation();
    expect(snapshot.theme).toBe('light');
    expect(snapshot.density).toBe('comfortable');
    expect(snapshot.tokens).toHaveProperty('--vui-color-background');
    expect(snapshot.tokens).toHaveProperty('--vui-size-control');
    expect(snapshot.motion.duration).toBeTypeOf('string');
    expect(snapshot.layers.dialog).toBeTypeOf('string');
    expect(snapshot.thresholds.narrow).toBeGreaterThan(0);
    expect(snapshot.thresholds.medium).toBeGreaterThan(snapshot.thresholds.narrow);
  });

  it('keeps theme, density, and container band independent', () => {
    for (const theme of themes) {
      for (const density of densities) {
        setTheme(theme);
        setDensity(density);
        const snapshot = readFoundation();
        expect(snapshot.theme).toBe(theme);
        expect(snapshot.density).toBe(density);
        expect(getTheme()).toBe(theme);
        expect(getDensity()).toBe(density);
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
