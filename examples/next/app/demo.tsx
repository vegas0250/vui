'use client';

import type { ComponentRef } from 'react';
import { useRef, useState } from 'react';
import { Button, Checkbox, Dialog, Input, Option, Select } from 'vui/react';

export function Demo() {
  const [name, setName] = useState('Ada');
  const [checked, setChecked] = useState(false);
  const [open, setOpen] = useState(false);
  const input = useRef<ComponentRef<typeof Input>>(null);
  return <section aria-label="Interactive example">
    <Input ref={input} label="Name" value={name}
      onInput={(event) => setName(event.currentTarget.value)} />
    <p role="status">Hello, {name}</p>
    <Checkbox checked={checked} onChange={(event) => setChecked(event.currentTarget.checked)}>
      Receive updates
    </Checkbox>
    <output>{checked ? 'Subscribed' : 'Unsubscribed'}</output>
    <Select label="Plan" value="free">
      <Option value="free">Free</Option><Option value="team">Team</Option>
    </Select>
    <Button onClick={() => setOpen(true)}>Open dialog</Button>
    <Dialog label="Welcome" open={open} onClose={() => setOpen(false)}>
      Hello, {name}!
      <Button slot="footer" onClick={() => setOpen(false)}>Close dialog</Button>
    </Dialog>
  </section>;
}
