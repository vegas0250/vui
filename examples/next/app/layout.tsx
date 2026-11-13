import type { ReactNode } from 'react';
import 'vui/themes/tokens';
import 'vui/themes/ui';
import 'vui/themes/system';
import './page.css';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-vui-theme="system" data-vui-ui="web">
      <body>{children}</body>
    </html>
  );
}
