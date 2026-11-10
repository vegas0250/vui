import { DataGrid, Panel, Text } from 'vui/react';
import { Demo } from './demo';

// This stays a Server Component. Serializable props cross the client boundary.
export default function Page() {
  return <main>
    <h1>VUI with Next.js</h1>
    <Panel>
      <Text>Rendered by a Server Component, enhanced in the browser.</Text>
      <DataGrid label="Packages" columns={[{ key: 'name', title: 'Name' }]}
        rows={[{ id: 'vui', name: 'VUI' }]} />
      <Demo />
    </Panel>
  </main>;
}
