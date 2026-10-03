/** Names shared by components. A component implements only the states that belong to it. */
export const componentStates = [
  'default',
  'hover',
  'active',
  'focus',
  'focus-visible',
  'disabled',
  'readonly',
  'loading',
  'selected',
  'checked',
  'pressed',
  'expanded',
  'open',
  'invalid',
  'required',
  'dragging',
  'drop-target',
] as const;

export type ComponentState = (typeof componentStates)[number];
