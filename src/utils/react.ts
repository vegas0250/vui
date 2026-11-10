'use client';

import { createElement, forwardRef, useCallback, useEffect, useRef } from 'react';
import type { DOMAttributes, HTMLAttributes } from 'react';

type EventName<K> = K extends `on${infer Name}Capture` ? Lowercase<Name>
  : K extends `on${infer Name}` ? Lowercase<Name> : never;
type EventAliases = { doubleclick: 'dblclick'; focus: 'focusin'; blur: 'focusout' };
type EventKey<K> = EventName<K> extends keyof EventAliases ? EventAliases[EventName<K>] : EventName<K>;
type NativeEvent<T, K> = (EventKey<K> extends keyof HTMLElementEventMap
  ? HTMLElementEventMap[EventKey<K>] : Event) & { currentTarget: T };

type Events<T> = {
  [K in keyof DOMAttributes<T> | 'onClose' | 'onCloseCapture' | 'onCancel' | 'onCancelCapture'
    as K extends `on${string}` ? K : never]?: (event: NativeEvent<T, K>) => void;
};

type Properties<T> = Partial<{
  [K in keyof T as K extends keyof HTMLElement | 'connectionCount' ? never
    : T[K] extends (...args: never[]) => unknown ? never : K]: T[K];
}>;

/** React callbacks receive the original DOM event, with the VUI host as currentTarget. */
export type ComponentProps<T extends HTMLElement> =
  Omit<HTMLAttributes<T>, keyof DOMAttributes<T>> &
  Pick<HTMLAttributes<T>, 'children' | 'dangerouslySetInnerHTML'> & Events<T> & Properties<T>;

function eventName(prop: string): [string, boolean] {
  const capture = prop.endsWith('Capture');
  const name = prop.slice(2, capture ? -7 : undefined).toLowerCase();
  return [{ doubleclick: 'dblclick', focus: 'focusin', blur: 'focusout' }[name] ?? name, capture];
}

/** One adapter: SSR emits light DOM; registration and properties run only in the browser. */
export function createComponent<T extends HTMLElement, Attributes extends object = object>(
  tag: string,
  load: () => Promise<unknown>,
  aliases: Record<string, string> = {},
) {
  const Component = forwardRef<T, ComponentProps<T> & Attributes>((props, forwardedRef) => {
    const host = useRef<T | null>(null);
    const setRef = useCallback((element: T | null) => {
      host.current = element;
      if (typeof forwardedRef === 'function') return forwardedRef(element);
      if (forwardedRef) forwardedRef.current = element;
    }, [forwardedRef]);
    const values = props as Record<string, unknown>;
    const attributes: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(values)) {
      if (/^on[A-Z]/.test(key) || key === 'ref') continue;
      if (key === 'children' || key === 'style' || key === 'dangerouslySetInnerHTML') attributes[key] = value;
      else if (value != null && ['string', 'number', 'boolean'].includes(typeof value)) {
        attributes[aliases[key] ?? (key === 'className' ? 'class' : key)] = value;
      }
    }

    useEffect(() => {
      const element = host.current;
      if (!element) return;
      let active = true;
      const listeners: Array<() => void> = [];
      for (const [key, value] of Object.entries(values)) {
        if (!/^on[A-Z]/.test(key) || typeof value !== 'function') continue;
        const [name, capture] = eventName(key);
        const listener = value as EventListener;
        element.addEventListener(name, listener, capture);
        listeners.push(() => element.removeEventListener(name, listener, capture));
      }
      // Reapply properties after upgrade: objects must never become HTML attributes,
      // and writing properties before definition would shadow prototype setters.
      void load().then(() => {
        if (!active) return;
        for (const [key, value] of Object.entries(values)) {
          if (key === 'children' || key === 'style' || key === 'ref' || key === 'dangerouslySetInnerHTML' || /^on[A-Z]/.test(key)) continue;
          if (value == null) {
            // React may remove a custom property by calling its setter with
            // undefined. Clear the reflected attribute rather than keeping
            // the literal string "undefined" from a string-only setter.
            element.removeAttribute(aliases[key] ?? (key === 'className' ? 'class' : key));
            continue;
          }
          if (key in element && !Object.is(Reflect.get(element, key), value)) {
            Reflect.set(element, key, value);
          }
        }
      });
      return () => {
        active = false;
        listeners.forEach((remove) => remove());
      };
    });

    // React 19 forwards this ref without changing the server-rendered markup.
    attributes.ref = setRef;
    return createElement(tag, attributes);
  });
  Component.displayName = tag;
  return Component;
}
