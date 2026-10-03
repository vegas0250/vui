import { standardEvents } from '../contract/types';
import { familyFor, familyMembers } from '../families/registry';
import { checkInteraction, interactionFor, platformKeys, resolvedInteraction, type PlatformKey } from '../interaction/contract';
import type { CompositionContract } from './types';
import { compositionForHost } from './registry';

function slotSelector(name: string): string {
  return name === '' ? 'slot:not([name])' : `slot[name="${name}"]`;
}

/** Structural check: slots, properties, events, and the interaction profile of a connected host. */
export function checkComposition(element: HTMLElement, contract: CompositionContract = compositionForHost(element.localName) as CompositionContract): string[] {
  if (!contract) return [`${element.localName} has no composition contract`];
  const failures: string[] = [];
  if (element.localName !== contract.host) failures.push(`expected ${contract.host}, received ${element.localName}`);
  const root = element.shadowRoot;
  if (!root) {
    failures.push('shadow root is missing');
    return failures;
  }
  for (const link of contract.links) {
    if (link.channel === 'slot' && link.direction === 'parent-child' && link.from === contract.host) {
      const name = link.slot ?? '';
      if (!root.querySelector(slotSelector(name))) failures.push(`slot ${name || '(default)'} is missing`);
    }
    if (link.channel === 'property' && !(link.to in element)) failures.push(`property ${link.to} is missing`);
    if (link.channel === 'event' && link.event && !standardEvents.includes(link.event as (typeof standardEvents)[number])) {
      failures.push(`${link.event} is outside the standard event set`);
    }
    if (link.direction === 'sibling' && link.channel !== 'attribute') {
      failures.push(`sibling ${link.from} → ${link.to} must use an attribute the parent resolves`);
    }
  }
  for (const eventName of contract.emits) {
    if (!standardEvents.includes(eventName as (typeof standardEvents)[number])) {
      failures.push(`${eventName} is outside the standard event set`);
    }
  }
  if (!interactionFor(element.localName)) failures.push('interaction profile is missing');
  failures.push(...checkInteraction(element));
  return failures;
}

function hasTextSlot(element: HTMLElement): boolean {
  return Boolean(element.shadowRoot?.querySelector('slot:not([name])'));
}

function verifyRule(element: HTMLElement, rule: string): string | null {
  const profile = resolvedInteraction(element.localName);
  switch (rule) {
    case 'disabled':
      return 'disabled' in element ? null : 'disabled is missing';
    case 'label':
      return 'label' in element || hasTextSlot(element) ? null : 'label is missing';
    case 'icon':
      return 'name' in element ? null : 'icon name is missing';
    case 'value':
      return 'value' in element || 'checked' in element ? null : 'value is missing';
    case 'required':
      return 'required' in element ? null : 'required is missing';
    case 'invalid':
    case 'error': {
      element.setAttribute('invalid', '');
      const marked = Boolean(element.shadowRoot?.querySelector('[aria-invalid="true"]'));
      element.removeAttribute('invalid');
      return marked ? null : 'invalid does not set aria-invalid';
    }
    case 'description': {
      element.setAttribute('hint', 'vui-description');
      const described = Boolean(element.shadowRoot?.querySelector('[aria-describedby]'));
      element.removeAttribute('hint');
      return described ? null : 'description is not linked with aria-describedby';
    }
    case 'activation':
      return element.shadowRoot?.querySelector('button, a') || 'command' in element ? null : 'activation control is missing';
    case 'loading': {
      element.setAttribute('loading', '');
      const busy = Boolean(element.shadowRoot?.querySelector('[aria-busy="true"]'));
      element.removeAttribute('loading');
      return busy ? null : 'loading does not set aria-busy';
    }
    case 'variant':
      return 'variant' in element ? null : 'variant is missing';
    case 'status':
      return element.shadowRoot?.querySelector('[role="status"], [role="alert"]') ? null : 'status role is missing';
    case 'level':
      return 'level' in element ? null : 'level is missing';
    case 'truncate':
      return 'truncate' in element ? null : 'truncate is missing';
    case 'regions':
      return element.shadowRoot?.querySelector('slot[name]') ? null : 'named region slot is missing';
    case 'gap':
    case 'padding':
    case 'align':
    case 'justify':
    case 'overflow':
      return rule in element ? null : `${rule} is missing`;
    case 'open':
      return 'open' in element || 'show' in element || 'showAt' in element ? null : 'open is missing';
    case 'close':
      return 'close' in element || element.localName === 'vui-tooltip' ? null : 'close is missing';
    case 'escape':
      return profile?.keyboard.includes('Escape') ? null : 'Escape is missing from the interaction profile';
    case 'focus-restore':
      return profile?.focus.includes('restore') ? null : 'focus restoration is missing';
    case 'positioning':
    case 'layering':
      return profile?.primitives.includes('pushOverlay') || profile?.primitives.includes('placeLayer')
        ? null
        : `${rule} does not use the overlay stack`;
    case 'keyboard': {
      if (!profile || profile.keyboard.length === 0) return 'keyboard profile is missing';
      const outside = profile.keyboard.filter((key) => !platformKeys.includes(key as PlatformKey));
      return outside.length ? `${outside.join(', ')} is outside the platform keyboard` : null;
    }
    case 'focus':
      return profile && profile.focus.length > 0 ? null : 'focus profile is missing';
    case 'roving':
      return profile?.focus.includes('roving') && profile.primitives.includes('applyRovingTabIndex')
        ? null
        : 'roving focus does not use applyRovingTabIndex';
    case 'selection':
      if ('selected' in element || 'selectedId' in element || 'checked' in element) return null;
      return profile && profile.selectionOwner !== 'none' ? null : 'selection is missing';
    default:
      return `unknown family rule ${rule}`;
  }
}

/** A connected member matches the family rules it claims. */
export function checkFamilyMember(element: HTMLElement): string[] {
  const memberships = familyMembers(element.localName);
  if (!memberships.length) return [`${element.localName} is not in a family`];
  const failures: string[] = [];
  for (const member of memberships) {
    const family = familyFor(member.family);
    if (!family) {
      failures.push(`family ${member.family} is not registered`);
      continue;
    }
    for (const rule of member.rules) {
      if (!family.rules.includes(rule)) failures.push(`${rule} is not a ${family.name} rule`);
      const failure = verifyRule(element, rule);
      if (failure) failures.push(`${member.family}: ${failure}`);
    }
  }
  return failures;
}
