'use client';

import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  DataGrid,
  Empty,
  FileTree,
  Input,
  Nav,
  NavItem,
  Panel,
  Properties,
  Property,
  ScrollArea,
  StatusBar,
  Switch,
  TemplateDashboard,
  TemplateSettings,
  TemplateWorkspace,
  Text,
  Textarea,
  Titlebar,
  Toolbar,
  TreeItem,
  VStack,
} from 'vui/react';

type AppId = 'dashboard' | 'settings' | 'workspace';

const rows = [
  { id: '1', name: 'Atlas', owner: 'Ada', status: 'active' },
  { id: '2', name: 'Orion', owner: 'Grace', status: 'draft' },
  { id: '3', name: 'Nova', owner: 'Lin', status: 'active' },
];

export function TemplatesDemo() {
  const [app, setApp] = useState<AppId>('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [name, setName] = useState('Ada');
  const [query, setQuery] = useState('');
  const filtered = useMemo(
    () => rows.filter((row) => row.name.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  const chrome = <>
    <Toolbar slot="toolbar" label="Commands">
      <strong slot="start">{app}</strong>
      <Button slot="start" variant="ghost" onClick={() => setCollapsed((value) => !value)}>
        Navigation
      </Button>
      <Button slot="end" variant="primary" onClick={() => setApp(app === 'dashboard' ? 'settings' : app === 'settings' ? 'workspace' : 'dashboard')}>
        Switch template
      </Button>
    </Toolbar>
    <StatusBar slot="footer">Ready</StatusBar>
  </>;

  const sharedProps = {
    label: 'VUI Templates',
    contentLabel: app === 'settings' ? 'Settings' : app === 'workspace' ? 'Editor and inspector' : 'Overview',
    collapsed,
    style: { height: '100%' } as const,
  };

  if (app === 'settings') {
    return <TemplateSettings {...sharedProps}>
      {chrome}
      <Nav slot="nav" label="Sections">
        <NavItem selected>Profile</NavItem>
        <NavItem>Access</NavItem>
      </Nav>
      <VStack gap="lg">
        <Panel heading="Profile">
          <VStack gap="md">
            <Input label="Name" value={name} onInput={(event) => setName(event.currentTarget.value)} />
            <Textarea label="Bio" rows="3" value="Builds interfaces with VUI." />
            <Switch checked>Email alerts</Switch>
          </VStack>
        </Panel>
        <Alert tone="warning">Seat limit reached for this workspace.</Alert>
        <Button variant="primary">Save</Button>
      </VStack>
    </TemplateSettings>;
  }

  if (app === 'workspace') {
    return <TemplateWorkspace {...sharedProps}>
      <Titlebar slot="header" label="Atlas" />
      {chrome}
      <FileTree slot="nav" label="Files">
        <TreeItem label="src" kind="folder" expanded>
          <TreeItem label="app.ts" kind="file" selected />
          <TreeItem label="theme.ts" kind="file" />
        </TreeItem>
        <TreeItem label="README.md" kind="file" />
      </FileTree>
      <ScrollArea slot="editor" label="Editor">
        <VStack gap="xs" padding="md">
          {Array.from({ length: 24 }, (_, index) => (
            <Text key={index} variant="code">{`const line${index} = ${index};`}</Text>
          ))}
        </VStack>
      </ScrollArea>
      <ScrollArea slot="inspector" label="Inspector">
        <VStack gap="md" padding="md">
          <Properties label="File">
            <Property label="Path">src/app.ts</Property>
            <Property label="Owner">Ada</Property>
          </Properties>
          <Empty heading="No problems">This file has no diagnostics.</Empty>
        </VStack>
      </ScrollArea>
    </TemplateWorkspace>;
  }

  return <TemplateDashboard {...sharedProps}>
    {chrome}
    <Nav slot="nav" label="Sections">
      <NavItem selected>Overview</NavItem>
      <NavItem>Orders</NavItem>
      <NavItem>Customers</NavItem>
    </Nav>
    <VStack gap="lg" padding="lg">
      <Alert tone="info" closable>Templates stay opt-in via vui/react adapters.</Alert>
      <Panel heading="Orders">
        <Input label="Filter" value={query} onInput={(event) => setQuery(event.currentTarget.value)} />
        <DataGrid
          label="Orders"
          emptyLabel="No matching orders"
          columns={[
            { key: 'name', title: 'Project' },
            { key: 'owner', title: 'Owner' },
            { key: 'status', title: 'Status' },
          ]}
          rows={filtered}
        />
      </Panel>
      <Empty heading="Inbox">When a customer writes, the thread shows up here.</Empty>
    </VStack>
  </TemplateDashboard>;
}
