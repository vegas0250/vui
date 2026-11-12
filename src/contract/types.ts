/** States a component may implement. `loading` stays optional until the component needs it. */
export type ContractState = 'disabled' | 'invalid' | 'loading';

export type AttributeKind = 'string' | 'boolean' | 'enum' | 'number';

export type ContractResponsive = 'container' | 'viewport' | 'flow';

/** `native` draws `:focus-visible` in this element's styles. `roving` keeps it on a child item. */
export type ContractFocus = 'native' | 'roving';

/** Optional bilingual docs string: `[ru, en]`. */
export type ContractCopy = string | readonly [string, string];

export interface AttributeContract {
  name: string;
  kind: AttributeKind;
  /** Property name when it is not the camelCase form of `name`. */
  property?: string;
  values?: readonly string[];
  reflected: boolean;
  /** `true` means the property is on, and the attribute is absent. `dismissable` works this way. */
  inverted?: boolean;
  /** Default value shown in documentation. */
  default?: string | boolean | number | null;
  /** Short attribute purpose for documentation. */
  description?: ContractCopy;
}

export interface EventContract {
  name: (typeof standardEvents)[number] | string;
  description?: ContractCopy;
  /** Defaults to true when omitted. */
  bubbles?: boolean;
  /** TypeScript-ish detail payload, e.g. `void` or `{ value: string }`. */
  detail?: string;
}

export interface DocsProperty {
  name: string;
  type: string;
  description?: ContractCopy;
}

export interface DocsMethod {
  name: string;
  signature?: string;
  description?: ContractCopy;
}

export interface DocsNamed {
  name: string;
  description?: ContractCopy;
}

export interface ComponentDocs {
  summary?: ContractCopy;
  guidance?: ContractCopy;
  properties?: readonly DocsProperty[];
  methods?: readonly DocsMethod[];
  slots?: readonly DocsNamed[];
  parts?: readonly DocsNamed[];
  tokens?: readonly string[];
}

export interface ComponentContract {
  element: string;
  className: string;
  attributes: readonly AttributeContract[];
  /** Event names or structured event docs. Compliance reads only `.name` / string. */
  events: readonly (string | EventContract)[];
  slots: readonly string[];
  parts: readonly string[];
  methods: readonly string[];
  keyboard: readonly string[];
  states: readonly ContractState[];
  responsive: ContractResponsive;
  focus: ContractFocus;
  /** ARIA role rendered in the shadow root, when the host has no implicit role. */
  role?: string;
  /** Documentation metadata; ignored by compliance. */
  docs?: ComponentDocs;
}

export const standardEvents = ['click', 'input', 'change', 'close', 'minimize', 'maximize'] as const;

export function eventName(event: string | EventContract): string {
  return typeof event === 'string' ? event : event.name;
}

export function eventNames(events: readonly (string | EventContract)[]): string[] {
  return events.map(eventName);
}
