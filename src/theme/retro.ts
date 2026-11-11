import type { ThemeTokens } from './presets';

/** User-supplied daisyUI Retro generator colors, converted from OKLCH to sRGB.
 * Keep source fills/content intact; readable soft text and boundaries are derived separately. */
export const retroColors: Readonly<Partial<ThemeTokens>> = Object.freeze({
  background: '#ece3ca', // oklch(91.637% 0.034 90.515)
  surface: '#e4d8b4', // oklch(88.272% 0.049 91.774)
  surfaceElevated: '#dbca9b', // oklch(84.133% 0.065 90.856)
  foreground: '#793205', // oklch(41% 0.112 45.904)
  primary: '#ff9fa0', // oklch(80% 0.114 19.571)
  primaryForeground: '#801518', // oklch(39% 0.141 25.723)
  secondary: '#b7f6cd', // oklch(92% 0.084 155.995)
  secondaryForeground: '#00642e', // oklch(44% 0.119 151.328)
  accent: '#d08700', // oklch(68% 0.162 75.834)
  accentForeground: '#793205', // oklch(41% 0.112 45.904)
  neutral: '#56524c', // oklch(44% 0.011 73.639)
  neutralOnSolid: '#d4d0ce', // oklch(86% 0.005 56.366)
  info: '#0082ce', // oklch(58% 0.158 241.966)
  infoOnSolid: '#fef2c6', // oklch(96% 0.059 95.617)
  success: '#00776f', // oklch(51% 0.096 186.391)
  successOnSolid: '#fef2c6', // oklch(96% 0.059 95.617)
  warning: '#f34700', // oklch(64% 0.222 41.116)
  warningOnSolid: '#fef2c6', // oklch(96% 0.059 95.617)
  error: '#ff6266', // oklch(70% 0.191 22.216)
  dangerOnSolid: '#7c2808', // oklch(40% 0.123 38.172)
  card: '#ece3ca',
  field: '#ece3ca',
  popover: '#ece3ca',
  modal: '#ece3ca',
  surfaceHover: '#dbca9b',
});
