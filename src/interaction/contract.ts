import { contractFor } from '../contract/registry';

/** Keys a component may declare. Anything else is a private keyboard. */
export const platformKeys = [
  'Tab',
  'Shift+Tab',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  'Space',
  'Escape',
  'Home',
  'End',
  'PageUp',
  'PageDown',
] as const;

export type PlatformKey = (typeof platformKeys)[number];

export type FocusBehavior = 'native' | 'roving' | 'trap' | 'restore' | 'active-descendant' | 'nested-overlay';

/** `attribute` is reflected state. `model` is SelectionModel. */
export type SelectionOwner = 'none' | 'attribute' | 'model';

/** `selection` means the cursor is the selection. `cursor` means it can move separately. */
export type ActiveItem = 'none' | 'selection' | 'cursor';

export const interactionPrimitives = [
  'native',
  'moveInList',
  'nextEnabled',
  'stepIndex',
  'applyRovingTabIndex',
  'isActivation',
  'SelectionModel',
  'pushOverlay',
  'placeLayer',
  'CommandRegistry',
  'trackPointer',
] as const;

export type InteractionPrimitive = (typeof interactionPrimitives)[number];

/**
 * Interaction → command → component action.
 * The component resolves a command id and calls CommandRegistry. It does not own shortcuts.
 */
export const commandPath = ['interaction', 'command', 'action'] as const;

export interface InteractionContract {
  element: string;
  focus: readonly FocusBehavior[];
  keyboard: readonly string[];
  selectionOwner: SelectionOwner;
  active: ActiveItem;
  /** True when activation goes through `commandPath`. */
  command: boolean;
  primitives: readonly InteractionPrimitive[];
}

const profiles = new Map<string, InteractionContract>();

export function registerInteraction(contract: InteractionContract): InteractionContract {
  profiles.set(contract.element, contract);
  return contract;
}

export function interactionFor(element: string): InteractionContract | undefined {
  return profiles.get(element);
}

export function listInteractions(): InteractionContract[] {
  return [...profiles.values()].sort((a, b) => a.element.localeCompare(b.element));
}

/** The profile for this element, or the host that owns its keyboard. */
export function resolvedInteraction(element: string): InteractionContract | undefined {
  const own = profiles.get(element);
  if (own) return own;
  const host: Record<string, string> = {
    'vui-tab': 'vui-tabs',
    'vui-tab-panel': 'vui-tabs',
    'vui-option': 'vui-select',
    'vui-tree-item': 'vui-file-tree',
    'vui-menu-item': 'vui-menu',
  };
  const parent = host[element];
  return parent ? profiles.get(parent) : undefined;
}

export function checkInteraction(element: HTMLElement): string[] {
  const profile = profiles.get(element.localName);
  if (!profile) return [];
  const failures: string[] = [];
  for (const key of profile.keyboard) {
    if (!platformKeys.includes(key as PlatformKey)) failures.push(`${key} is outside the platform keyboard`);
  }
  const component = contractFor(element.localName);
  if (component) {
    const declared = [...component.keyboard].sort().join('\0');
    const listed = [...profile.keyboard].sort().join('\0');
    if (declared !== listed) failures.push('interaction keyboard does not match the component contract');
    if (component.focus === 'roving' && !profile.focus.includes('roving')) {
      failures.push('roving focus is missing from the interaction profile');
    }
    if (component.focus === 'native' && !profile.focus.includes('native') && !profile.focus.includes('active-descendant')) {
      failures.push('native focus is missing from the interaction profile');
    }
  }
  if (profile.selectionOwner === 'model' && !profile.primitives.includes('SelectionModel')) {
    failures.push('SelectionModel is not declared');
  }
  if (profile.command && !profile.primitives.includes('CommandRegistry')) failures.push('command path does not use CommandRegistry');
  if (profile.focus.includes('roving') && !profile.primitives.includes('applyRovingTabIndex')) {
    failures.push('roving focus does not use applyRovingTabIndex');
  }
  return failures;
}
