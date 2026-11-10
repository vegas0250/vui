const seen = new Set<string>();

/**
 * One warning per distinct developer mistake.
 * The component keeps running: unknown values stay as written and are not rewritten.
 */
export function reportDeveloper(code: string, message: string): void {
  const key = `${code}\n${message}`;
  if (seen.has(key)) return;
  seen.add(key);
  console.warn(`vui: ${message}`);
}

/** Direct element children that this parent does not own. Slotted extras are ignored. */
export function reportUnexpectedChildren(host: HTMLElement, allowed: readonly string[]): void {
  for (const child of host.children) {
    if (allowed.includes(child.localName) || child.hasAttribute('slot')) continue;
    reportDeveloper(
      'child',
      `${host.localName} ignores <${child.localName}>. Expected ${allowed.join(' or ')}.`,
    );
  }
}
