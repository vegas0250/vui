import type { AttributeContract, ComponentContract } from './types';
import { standardEvents } from './types';

const colorLiteral = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\brgba?\(|\bhsla?\(/g;

function camel(name: string): string {
  return name.replace(/-([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

/** Color literals in component CSS. `transparent` and `currentColor` are not design colors. */
export function designLiteralViolations(css: string): string[] {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const found = source.match(colorLiteral);
  if (!found) return [];
  return [...new Set(found)];
}

export function componentStyleText(element: HTMLElement): string {
  const root = element.shadowRoot;
  if (!root) return '';
  const adopted = [...(root.adoptedStyleSheets ?? [])].map((sheet) => {
    try {
      return [...sheet.cssRules].map((rule) => rule.cssText).join('\n');
    } catch {
      return '';
    }
  });
  const inline = [...root.querySelectorAll('style')].map((node) => node.textContent ?? '');
  return [...adopted, ...inline].join('\n');
}

function propertyName(attribute: AttributeContract): string {
  return attribute.property ?? camel(attribute.name);
}

function checkAttribute(element: HTMLElement, attribute: AttributeContract): string | null {
  if (!attribute.reflected) return null;
  const property = propertyName(attribute);
  if (!(property in element)) return `${attribute.name} has no property ${property}`;
  const record = element as unknown as Record<string, unknown>;
  if (attribute.kind === 'boolean') {
    if (attribute.inverted) {
      record[property] = false;
      if (element.getAttribute(attribute.name) !== 'false') return `${property} false does not set ${attribute.name}="false"`;
      record[property] = true;
      if (element.hasAttribute(attribute.name)) return `${property} true leaves ${attribute.name} set`;
      return null;
    }
    record[property] = true;
    if (!element.hasAttribute(attribute.name)) return `${property} does not set ${attribute.name}`;
    record[property] = false;
    if (element.hasAttribute(attribute.name)) return `${property} false leaves ${attribute.name} set`;
    return null;
  }
  if (attribute.kind === 'number') {
    record[property] = 1;
    return null;
  }
  const sample = attribute.values?.[0] ?? 'vui-sample';
  record[property] = sample;
  if (element.getAttribute(attribute.name) !== sample) return `${property} does not reflect ${attribute.name}`;
  return null;
}

function checkResponsive(contract: ComponentContract, css: string): string | null {
  if (contract.responsive === 'viewport') {
    if (!/@media|max-width:\s*100%|100vw|100dvh/.test(css)) return 'viewport contract has no viewport constraint';
    return null;
  }
  if (!/min-width:\s*0|max-width:\s*100%/.test(css)) return 'responsive contract is missing min-width: 0 or max-width: 100%';
  return null;
}

/**
 * Platform checks for one connected component.
 * The element should be in the document. Reflected properties are written and then restored when the check knows how.
 */
export function checkCompliance(element: HTMLElement, contract: ComponentContract): string[] {
  const failures: string[] = [];
  if (element.localName !== contract.element) failures.push(`expected ${contract.element}, received ${element.localName}`);
  if (!customElements.get(contract.element)) failures.push(`${contract.element} is not registered`);
  const root = element.shadowRoot;
  if (!root) {
    failures.push('shadow root is missing');
    return failures;
  }
  if (root.mode !== 'open') failures.push('shadow root is not open');

  const css = componentStyleText(element);
  const colors = designLiteralViolations(css);
  if (colors.length) failures.push(`hardcoded design color: ${colors.join(', ')}`);
  if (!css.includes('var(--vui-')) failures.push('styles do not use Foundation tokens');
  if (!css.includes('--vui-color-text')) failures.push('theme token --vui-color-text is missing from base styles');
  if (!css.includes('--vui-font-size')) failures.push('density token --vui-font-size is missing from base styles');
  if (!css.includes('prefers-reduced-motion')) failures.push('reduced motion is missing from base styles');
  if (contract.focus === 'native' && !css.includes(':focus-visible') && !css.includes('--vui-focus-ring')) {
    failures.push('focus-visible ring is missing');
  }

  const responsive = checkResponsive(contract, css);
  if (responsive) failures.push(responsive);

  for (const eventName of contract.events) {
    if (!standardEvents.includes(eventName as (typeof standardEvents)[number])) {
      failures.push(`${eventName} is outside the standard event set`);
    }
  }

  for (const slot of contract.slots) {
    const selector = slot === '' ? 'slot:not([name])' : `slot[name="${slot}"]`;
    if (!root.querySelector(selector)) failures.push(`slot ${slot || '(default)'} is missing`);
  }
  for (const part of contract.parts) {
    if (!root.querySelector(`[part~="${part}"]`)) failures.push(`part ${part} is missing`);
  }
  for (const method of contract.methods) {
    const value = (element as unknown as Record<string, unknown>)[method];
    if (typeof value !== 'function') failures.push(`method ${method} is missing`);
  }
  if (contract.role && !root.querySelector(`[role="${contract.role}"]`)) {
    failures.push(`role ${contract.role} is missing`);
  }

  for (const attribute of contract.attributes) {
    const failure = checkAttribute(element, attribute);
    if (failure) failures.push(failure);
  }

  if (contract.states.includes('disabled')) {
    element.setAttribute('disabled', '');
    const native = root.querySelector('button, input, select, textarea');
    if (
      native instanceof HTMLButtonElement ||
      native instanceof HTMLInputElement ||
      native instanceof HTMLSelectElement ||
      native instanceof HTMLTextAreaElement
    ) {
      if (!native.disabled) failures.push('disabled does not reach the native control');
    } else {
      const aria = root.querySelector('[aria-disabled="true"]') ?? element.getAttribute('aria-disabled');
      if (aria !== 'true' && !(aria instanceof Element)) failures.push('disabled has no native control or aria-disabled');
    }
    element.removeAttribute('disabled');
  }

  if (contract.states.includes('invalid')) {
    element.setAttribute('invalid', '');
    if (!root.querySelector('[aria-invalid="true"]')) failures.push('invalid does not set aria-invalid');
    element.removeAttribute('invalid');
  }

  if (contract.states.includes('loading')) {
    element.setAttribute('loading', '');
    if (!root.querySelector('[aria-busy="true"]')) failures.push('loading does not set aria-busy');
    element.removeAttribute('loading');
  }

  return failures;
}

/** Disconnect and connect again. Returns the shadow root from before the cycle so the caller can confirm it was kept. */
export function remount(element: HTMLElement): ShadowRoot | null {
  const shadow = element.shadowRoot;
  const parent = element.parentElement;
  if (!parent) return shadow;
  parent.removeChild(element);
  parent.append(element);
  return shadow;
}
