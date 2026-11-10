/** Inlined by Vite in the head before first paint; never evaluates persisted CSS. */
import { builtInThemes, defaultThemes } from '../theme/presets';
export function themeBootScript(): string {
  const palettes = Object.fromEntries(
    builtInThemes.map((p) => [
      p.id,
      {
        mode: p.mode,
        background: p.tokens.background,
        foreground: p.tokens.foreground,
      },
    ]),
  );
  return `(()=>{const palettes=${JSON.stringify(palettes)},root=document.documentElement;let preference;try{preference=JSON.parse(localStorage.getItem('vui.theme.preference.v1')||'null')}catch{}const fallback=matchMedia('(prefers-color-scheme: dark)').matches?'${defaultThemes.dark}':'${defaultThemes.light}';const id=typeof preference==='string'&&palettes[preference]?preference:preference&&typeof preference==='object'&&palettes[preference.baseTheme]?preference.baseTheme:fallback;const base=palettes[id],mode=preference&&typeof preference==='object'&&['light','dark'].includes(preference.mode)?preference.mode:base.mode;root.dataset.vuiTheme=id;root.dataset.vuiMode=mode;root.style.colorScheme=mode;for(const [token,property]of[['background','--vui-color-background'],['foreground','--vui-color-text']]){const custom=preference&&typeof preference==='object'&&preference.tokens&&preference.tokens[token];root.style.setProperty(property,typeof custom==='string'&&/^#[0-9a-f]{6}([0-9a-f]{2})?$/i.test(custom)?custom:base[token]);}root.style.backgroundColor='var(--vui-color-background)';root.style.color='var(--vui-color-text)';})();`;
}
