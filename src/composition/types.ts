/** Who may talk to whom. Siblings do not call each other. */
export type CompositionDirection = 'parent-child' | 'child-parent' | 'sibling';

/**
 * The only channels a composition may use.
 * `light-dom` and `slot` are parent ownership. `property` is data the parent renders itself.
 * `attribute` is public state a parent reads. `event` is a standard DOM event.
 */
export type CompositionChannel = 'light-dom' | 'slot' | 'property' | 'attribute' | 'event';

export interface CompositionLink {
  from: string;
  to: string;
  direction: CompositionDirection;
  channel: CompositionChannel;
  /** Slot name when `channel` is `slot`. An empty string is the default slot. */
  slot?: string;
  /** Standard event name when `channel` is `event`. */
  event?: string;
}

export interface CompositionContract {
  id: string;
  host: string;
  /** What this composition is, in one sentence. */
  summary: string;
  links: readonly CompositionLink[];
  /** Events the host emits toward the page. */
  emits: readonly string[];
}
