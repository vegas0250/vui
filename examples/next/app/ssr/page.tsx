import { headers } from 'next/headers';
import { Button } from 'vui/react';

// Reading request headers makes this route render on the server for each request.
export default async function ServerRenderedPage() {
  const request = await headers();
  return <main>
    <h1>Request-time SSR</h1>
    <Button>{request.get('x-vui-example') ?? 'Rendered for this request'}</Button>
  </main>;
}
