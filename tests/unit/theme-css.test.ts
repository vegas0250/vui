import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { builtInThemeStylesheets } from '../../src/theme/stylesheet';

describe('generated theme stylesheets', () => {
  const sheets = builtInThemeStylesheets();
  for (const [name, css] of Object.entries(sheets)) {
    it(`themes/${name}.css matches the VUI ${name} preset`, () => {
      const file = resolve(__dirname, `../../themes/${name}.css`);
      if (process.env.VUI_WRITE_THEME_CSS) writeFileSync(file, css);
      expect(readFileSync(file, 'utf8').replace(/\r\n/g, '\n')).toBe(css);
    });
  }
});
