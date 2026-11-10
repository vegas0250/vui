# React and Next.js

Use React 19 or newer in the 19.x line. All existing custom elements have named
adapters in `vui/react`: `VButton` becomes `Button`, `VDataGrid` becomes `DataGrid`,
and child elements such as `Option`, `Tab`, `TabPanel`, and `MenuItem` have their
own adapters. They render the real elements and retain slots, parts, CSS variables,
keyboard behavior and focus handling. No provider is required.

## Attributes, properties and events

The [component reference](components.md) lists attributes, properties, methods,
slots and events. Use its attribute spelling (`readonly`, `close-label`) or typed
properties (`closeLabel`) as React props. Boolean props accept booleans; a false
prop removes a presence attribute. Object properties are assigned after upgrade:

```tsx
import { DataGrid } from 'vui/react';
<DataGrid label="People"
  columns={[{ key: 'name', title: 'Name' }]}
  rows={[{ id: '1', name: 'Ada' }]} />
```

Callbacks receive native DOM events, not React SyntheticEvents. `currentTarget`
is typed as the element, so `onInput={e => setValue(e.currentTarget.value)}` and
`onChange={e => setChecked(e.currentTarget.checked)}` work without casting.
Use `onClick`, `onKeyDown`, `onClose` and other standard event prop names; capture
variants are supported. Custom event details retain the element's existing API.

Use `value` and `checked` with callbacks for controlled state. Do not mutate a
controlled property through a ref without updating application state. Omitting a
property leaves the element in control of it; pass an explicit empty value or
`false` to reset it. Objects and arrays should be immutable application values.

## Refs and slots

```tsx
'use client';
import { useRef } from 'react';
import type { ComponentRef } from 'react';
import { Button, Input } from 'vui/react';

export function Form() {
  const input = useRef<ComponentRef<typeof Input>>(null);
  return <>
    <Input ref={input} label="Name"><span slot="suffix">Optional</span></Input>
    <Button onClick={async () => {
      await customElements.whenDefined('vui-input');
      input.current?.focus();
    }}>Focus name</Button>
  </>;
}
```

The ref points to the host immediately. Wait for `customElements.whenDefined()`
before invoking element-specific methods. Native DOM APIs are available right
away. Use `slot` on children and `::part(...)` in application CSS as with HTML.

## Server rendering

Server Components can import adapters and pass serializable attributes, children,
rows and columns. Event handlers, refs and browser theme functions belong in Client
Components. Do not import `vui`, `vui/button`, or category registration modules on
the server; these extend browser `HTMLElement`.

SSR emits light DOM only. Shadow DOM controls, ARIA state inside those controls,
and keyboard behavior initialize after browser registration. This means forms
built from these elements require JavaScript. For content that must work before
JavaScript, use native HTML in your application. The adapter preserves server
markup during hydration and does not disable SSR.

CSS entry points may be imported in a Next.js root layout. Theme functions should
be called after mount or in event callbacks; explicit theme preferences take
precedence over OS appearance. Theme Studio's editor state is never required.

## Working example

From the repository root:

```sh
pnpm build
pnpm --dir examples/next install
pnpm --dir examples/next dev
```

For repeatable production verification, run `pnpm check:next`. It tests the packed
package rather than source aliases. The `/ssr` route reads a request header to demonstrate request-time rendering.
The example stays outside a workspace and is
not published as a second package.

For the framework rules behind this integration, see React's
[custom HTML elements](https://react.dev/reference/react-dom/components#custom-html-elements)
and Next.js's
[Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).
