type ReflectHost = { prototype: object };

function hasOwn(proto: object, key: string): boolean {
  return Object.prototype.hasOwnProperty.call(proto, key);
}

function define(host: ReflectHost, prop: string, descriptor: PropertyDescriptor): void {
  if (hasOwn(host.prototype, prop)) return;
  Object.defineProperty(host.prototype, prop, {
    enumerable: true,
    configurable: true,
    ...descriptor,
  });
}

/** Attribute name, or a map of property name → attribute name. */
export type AttrSpec = string[] | Record<string, string>;

function pairs(spec: AttrSpec): Array<[string, string]> {
  if (Array.isArray(spec)) return spec.map((name) => [name, name]);
  return Object.entries(spec);
}

/**
 * String properties mirror attributes.
 * `null` and `undefined` remove the attribute. A missing attribute reads as `''`.
 */
export function reflectStrings(host: ReflectHost, spec: AttrSpec): void {
  for (const [prop, attr] of pairs(spec)) {
    define(host, prop, {
      get(this: HTMLElement): string {
        return this.getAttribute(attr) ?? '';
      },
      set(this: HTMLElement, value: string | null) {
        if (value == null) this.removeAttribute(attr);
        else this.setAttribute(attr, String(value));
      },
    });
  }
}

/** Boolean properties mirror the presence of an attribute. */
export function reflectBooleans(host: ReflectHost, spec: AttrSpec): void {
  for (const [prop, attr] of pairs(spec)) {
    define(host, prop, {
      get(this: HTMLElement): boolean {
        return this.hasAttribute(attr);
      },
      set(this: HTMLElement, value: boolean) {
        this.toggleAttribute(attr, Boolean(value));
      },
    });
  }
}
