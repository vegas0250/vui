import { beforeEach, describe, expect, it } from 'vitest';
import { listContracts } from '../../src/contract';
import '../../src/index';
import { installVuiStyles } from '../../src/theme/install';
import { setTheme, setUIMode, type VuiUIMode } from '../../src/theme';
import uiCss from '../../src/tokens/ui.css?raw';

const modes: VuiUIMode[] = ['web', 'desktop', 'terminal'];
const themes = ['light', 'dark', 'high-contrast', 'system'] as const;

describe('component × UI mode matrix', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    installVuiStyles();
    setTheme('light');
    setUIMode('web');
  });

  it('registers a contract for every published custom element except vui-option', () => {
    const contracts = listContracts().map((item) => item.element).sort();
    expect(contracts.length).toBeGreaterThan(40);
    expect(contracts).not.toContain('vui-option');
    for (const element of contracts) {
      expect(customElements.get(element)).toBeTypeOf('function');
    }
  });

  it('defines structural scales for every UI mode and HC focus overlay after modes', () => {
    for (const mode of modes) {
      expect(uiCss).toContain(`[data-vui-ui="${mode}"]`);
    }
    expect(uiCss).toContain('--vui-opacity-disabled:');
    expect(uiCss).toContain('--vui-scrollbar-size:');
    expect(uiCss).toContain('--vui-drawer-inline:');
    expect(uiCss).toContain('--vui-resizer-hit-size:');
    const terminalIndex = uiCss.indexOf('[data-vui-ui="terminal"]');
    const hcIndex = uiCss.indexOf('[data-vui-theme="high-contrast"]');
    expect(terminalIndex).toBeGreaterThan(-1);
    expect(hcIndex).toBeGreaterThan(terminalIndex);
  });

  it('mounts representative components in every theme × UI mode pair', () => {
    const samples = [
      'vui-button',
      'vui-icon-button',
      'vui-input',
      'vui-select',
      'vui-checkbox',
      'vui-dialog',
      'vui-menu',
      'vui-panel',
      'vui-toolbar',
      'vui-data-grid',
      'vui-list',
      'vui-file-tree',
      'vui-shell',
      'vui-tabs',
      'vui-alert',
      'vui-toast',
    ];
    for (const theme of themes) {
      for (const mode of modes) {
        setTheme(theme);
        setUIMode(mode);
        expect(document.documentElement.getAttribute('data-vui-theme')).toBe(theme);
        expect(document.documentElement.getAttribute('data-vui-ui')).toBe(mode);
        for (const tag of samples) {
          const node = document.createElement(tag);
          document.body.append(node);
          expect(node.isConnected).toBe(true);
          expect(node.shadowRoot).not.toBeNull();
          node.remove();
        }
      }
    }
  });
});
