export function defineElement(name: string, ctor: CustomElementConstructor): void {
  if (!customElements.get(name)) {
    customElements.define(name, ctor);
  }
}
