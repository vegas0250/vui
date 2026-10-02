import { installVuiStyles } from '../theme/install';
import { mountStyles } from './styles';

export abstract class VuiElement extends HTMLElement {
  static shadowDelegatesFocus = true;

  protected readonly shadow: ShadowRoot;
  private rendered = false;

  constructor() {
    super();
    const ctor = new.target as typeof VuiElement;
    this.shadow = this.attachShadow({
      mode: 'open',
      delegatesFocus: ctor.shadowDelegatesFocus !== false,
    });
  }

  connectedCallback(): void {
    installVuiStyles();
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
}
