import type { CommandRegistry } from './commands';

export interface Shortcut {
  /** `Ctrl+S`, `Mod+K`, `Alt+ArrowLeft`. `Mod` is Ctrl, or Meta on Apple platforms. */
  keys: string;
  command: string;
  /** Active only while this context is on the registry stack. Omit for the whole registry. */
  context?: string;
  enabled?: boolean;
}

export class ShortcutConflictError extends Error {
  readonly keys: string;
  readonly context: string;

  constructor(keys: string, context: string) {
    super(`Shortcut "${keys}" is already registered${context ? ` for context "${context}"` : ''}`);
    this.name = 'ShortcutConflictError';
    this.keys = keys;
    this.context = context;
  }
}

const MODIFIERS = ['Ctrl', 'Alt', 'Shift', 'Meta', 'Mod'] as const;

function applePlatform(): boolean {
  return typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform);
}

function keyToken(part: string): string {
  const lower = part.toLowerCase();
  const named: Record<string, string> = {
    esc: 'Escape',
    escape: 'Escape',
    space: ' ',
    spacebar: ' ',
    plus: '+',
    arrowup: 'ArrowUp',
    arrowdown: 'ArrowDown',
    arrowleft: 'ArrowLeft',
    arrowright: 'ArrowRight',
    pageup: 'PageUp',
    pagedown: 'PageDown',
    home: 'Home',
    end: 'End',
    enter: 'Enter',
    tab: 'Tab',
  };
  if (named[lower]) return named[lower];
  return part.length === 1 ? part.toUpperCase() : part;
}

/** Canonical shortcut text: modifiers in a fixed order, then the key. */
export function normalizeShortcut(input: string): string {
  const mods = new Set<string>();
  let key = '';
  for (const part of input.split('+').map((item) => item.trim()).filter(Boolean)) {
    const lower = part.toLowerCase();
    if (lower === 'ctrl' || lower === 'control') mods.add('Ctrl');
    else if (lower === 'alt' || lower === 'option') mods.add('Alt');
    else if (lower === 'shift') mods.add('Shift');
    else if (lower === 'meta' || lower === 'cmd' || lower === 'command') mods.add('Meta');
    else if (lower === 'mod') mods.add('Mod');
    else key = keyToken(part);
  }
  const ordered: string[] = MODIFIERS.filter((name) => mods.has(name));
  if (key) ordered.push(key);
  return ordered.join('+');
}

/** Platform chord. `Mod` becomes Meta on Apple platforms and Ctrl elsewhere. */
export function formatShortcut(input: string): string {
  const mod = applePlatform() ? 'Meta' : 'Ctrl';
  return normalizeShortcut(normalizeShortcut(input).replaceAll('Mod', mod));
}

export function eventShortcut(event: KeyboardEvent): string {
  const mods: string[] = [];
  if (event.ctrlKey) mods.push('Ctrl');
  if (event.altKey) mods.push('Alt');
  if (event.shiftKey) mods.push('Shift');
  if (event.metaKey) mods.push('Meta');
  if (['Control', 'Alt', 'Shift', 'Meta'].includes(event.key)) return mods.join('+');
  const key = event.key.length === 1 ? event.key.toUpperCase() : event.key;
  return [...mods, key].join('+');
}

function sameChord(binding: string, event: KeyboardEvent): boolean {
  const pressed = eventShortcut(event);
  return normalizeShortcut(binding) === pressed || formatShortcut(binding) === pressed;
}

function typingTarget(event: KeyboardEvent): boolean {
  const node = event.composedPath()[0];
  if (!(node instanceof HTMLElement)) return false;
  if (node.isContentEditable) return true;
  if (node instanceof HTMLTextAreaElement || node instanceof HTMLSelectElement) return true;
  if (node instanceof HTMLInputElement) {
    return !['button', 'checkbox', 'radio', 'range', 'submit', 'reset', 'file', 'color'].includes(node.type);
  }
  return false;
}

/**
 * Shortcuts for one command registry. Attach it to the element that should see the keys.
 * Contexts nest: the innermost matching context wins over a shortcut with no context.
 */
export class ShortcutRegistry {
  private readonly bindings: Shortcut[] = [];
  private readonly contexts: string[] = [];

  constructor(private readonly commands: CommandRegistry) {}

  register(shortcut: Shortcut): () => void {
    const keys = normalizeShortcut(shortcut.keys);
    const context = shortcut.context ?? '';
    const conflict = this.bindings.find(
      (binding) =>
        (binding.context ?? '') === context &&
        (normalizeShortcut(binding.keys) === keys || formatShortcut(binding.keys) === formatShortcut(keys)),
    );
    if (conflict) throw new ShortcutConflictError(keys, context);
    const stored: Shortcut = { ...shortcut, keys, enabled: shortcut.enabled !== false };
    this.bindings.push(stored);
    return () => {
      const index = this.bindings.indexOf(stored);
      if (index >= 0) this.bindings.splice(index, 1);
    };
  }

  list(): readonly Shortcut[] {
    return this.bindings;
  }

  pushContext(context: string): () => void {
    this.contexts.push(context);
    return () => {
      const index = this.contexts.lastIndexOf(context);
      if (index >= 0) this.contexts.splice(index, 1);
    };
  }

  activeContext(): string | null {
    return this.contexts[this.contexts.length - 1] ?? null;
  }

  /** Listen on `target` until the returned function is called. */
  attach(target: EventTarget): () => void {
    const listener = (event: Event): void => {
      if (event instanceof KeyboardEvent) this.handle(event);
    };
    target.addEventListener('keydown', listener);
    return () => target.removeEventListener('keydown', listener);
  }

  /** Returns true when a shortcut ran. */
  handle(event: KeyboardEvent): boolean {
    if (event.defaultPrevented) return false;
    if (typingTarget(event) && !event.ctrlKey && !event.metaKey && !event.altKey) return false;
    let winner: { shortcut: Shortcut; depth: number } | null = null;
    for (const shortcut of this.bindings) {
      if (shortcut.enabled === false) continue;
      if (!sameChord(shortcut.keys, event)) continue;
      let depth = -1;
      if (shortcut.context) {
        depth = this.contexts.lastIndexOf(shortcut.context);
        if (depth < 0) continue;
      }
      if (!winner || depth >= winner.depth) winner = { shortcut, depth };
    }
    if (!winner) return false;
    const ran = this.commands.execute(winner.shortcut.command);
    if (!ran) return false;
    event.preventDefault();
    event.stopPropagation();
    return true;
  }
}
