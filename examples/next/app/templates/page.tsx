import { TemplatesDemo } from './demo';

/** Server Component entry: templates load only inside the client demo. */
export default function TemplatesPage() {
  return <main style={{ height: '100vh', margin: 0 }}>
    <TemplatesDemo />
  </main>;
}
