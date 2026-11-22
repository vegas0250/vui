import tokensCss from '../tokens/tokens.css?raw';
import uiCss from '../tokens/ui.css?raw';
import darkCss from '../../themes/dark.css?raw';
import lightCss from '../../themes/light.css?raw';
import systemCss from '../../themes/system.css?raw';

/* themes/*.css are generated from the VUI presets (tests/unit/theme-css.test.ts keeps them in sync). */

const STYLE_ID = 'vui-styles';
let installed = false;

export function installVuiStyles(): void {
  if (installed || typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) {
    installed = true;
    return;
  }

  const style = document.createElement('style');
  style.id = STYLE_ID;
  // ui.css last so mode structure (focus, elevation) wins over theme colors.
  style.textContent = [tokensCss, lightCss, darkCss, systemCss, uiCss].join('\n');
  document.head.append(style);
  installed = true;
}
