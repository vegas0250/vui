import { reportDeveloper } from './dev';

export function defineElement(name: string, ctor: CustomElementConstructor): void {
  const existing = customElements.get(name);
  if (!existing) {
    customElements.define(name, ctor);
    return;
  }
  if (existing !== ctor) {
    reportDeveloper('register', `${name} is already defined by another class. The first registration stays.`);
  }
}
