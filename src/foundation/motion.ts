import { readToken } from './tokens';

export const motionTokens = {
  duration: '--vui-duration',
  easing: '--vui-easing',
} as const;

export interface MotionSnapshot {
  duration: string;
  easing: string;
}

export function readMotion(element: Element = document.documentElement): MotionSnapshot {
  return {
    duration: readToken(motionTokens.duration, element),
    easing: readToken(motionTokens.easing, element),
  };
}
