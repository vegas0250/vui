import densityCss from '../tokens/density.css?raw';
import tokensCss from '../tokens/tokens.css?raw';
import darkCss from '../../themes/dark.css?raw';
import highContrastCss from '../../themes/high-contrast.css?raw';
import lightCss from '../../themes/light.css?raw';
import neonCyanCss from '../../themes/neon-cyan.css?raw';
import neonGreenCss from '../../themes/neon-green.css?raw';
import neonMagentaCss from '../../themes/neon-magenta.css?raw';
import systemCss from '../../themes/system.css?raw';

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
  style.textContent = [tokensCss, densityCss, lightCss, darkCss, highContrastCss, neonGreenCss, neonMagentaCss, neonCyanCss, systemCss].join('\n');
  document.head.append(style);
  installed = true;
}
