import { connectFoundation } from '../foundation/runtime';
import { mountStyles } from './styles';

export abstract class VuiElement extends HTMLElement {
  static shadowDelegatesFocus = true;

  protected readonly shadow: ShadowRoot;
  private rendered = false;
  private connections = 0;
  private readonly holds = new Map<string, () => void>();

  constructor() {
    super();
    const ctor = new.target as typeof VuiElement;
    this.shadow = this.attachShadow({
      mode: 'open',
      delegatesFocus: ctor.shadowDelegatesFocus !== false,
    });
  }

  /** How many times this element has connected. The shadow root is created once. */
  get connectionCount(): number {
    return this.connections;
  }

  connectedCallback(): void {
    this.connections += 1;
    connectFoundation();
    if (!this.rendered) {
      this.shadow.innerHTML = this.template();
      mountStyles(this.shadow, this.componentStyles(), this.styleId());
      this.rendered = true;
      this.afterRender();
    }
    this.sync();
  }

  attributeChangedCallback(): void {
    if (this.rendered) this.sync();
  }

  protected abstract template(): string;

  protected abstract componentStyles(): string;

  protected styleId(): string {
    return this.localName;
  }

  protected afterRender(): void {}

  protected sync(): void {}

  protected qs<T extends Element>(selector: string): T {
    const node = this.shadow.querySelector(selector);
    if (!node) {
      throw new Error(`${this.localName} is missing ${selector}`);
    }
    return node as T;
  }

  protected isDisabled(): boolean {
    return this.hasAttribute('disabled');
  }

  /** Replace a named teardown. `disconnectedCallback` runs every held function once. */
  protected hold(name: string, dispose: () => void): void {
    this.holds.get(name)?.();
    this.holds.set(name, dispose);
  }

  /**
   * Listen until disconnect. The same `name` replaces the previous listener,
   * so `connectedCallback` can bind again without stacking handlers.
   */
  protected bind(
    name: string,
    target: EventTarget,
    type: string,
    listener: EventListener,
    options?: boolean | AddEventListenerOptions,
  ): void {
    target.addEventListener(type, listener, options);
    this.hold(name, () => target.removeEventListener(type, listener, options));
  }

  disconnectedCallback(): void {
    for (const dispose of this.holds.values()) dispose();
    this.holds.clear();
  }
}
