/** States a component may implement. `loading` stays optional until the component needs it. */
export type ContractState = 'disabled' | 'invalid' | 'loading';

export type AttributeKind = 'string' | 'boolean' | 'enum' | 'number';

export type ContractResponsive = 'container' | 'viewport' | 'flow';

/** `native` draws `:focus-visible` in this element's styles. `roving` keeps it on a child item. */
export type ContractFocus = 'native' | 'roving';

export interface AttributeContract {
  name: string;
  kind: AttributeKind;
  /** Property name when it is not the camelCase form of `name`. */
  property?: string;
  values?: readonly string[];
  reflected: boolean;
  /** `true` means the property is on, and the attribute is absent. `dismissable` works this way. */
  inverted?: boolean;
}

export interface ComponentContract {
  element: string;
  className: string;
  attributes: readonly AttributeContract[];
  events: readonly string[];
  slots: readonly string[];
  parts: readonly string[];
  methods: readonly string[];
  keyboard: readonly string[];
  states: readonly ContractState[];
  responsive: ContractResponsive;
  focus: ContractFocus;
  /** ARIA role rendered in the shadow root, when the host has no implicit role. */
  role?: string;
}

export const standardEvents = ['click', 'input', 'change', 'close', 'minimize', 'maximize'] as const;
