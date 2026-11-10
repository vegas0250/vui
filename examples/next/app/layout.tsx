import type { ReactNode } from 'react';
import 'vui/themes/tokens';
import 'vui/themes/density';
import 'vui/themes/system';
import './page.css';

export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en" data-vui-theme="system"><body>{children}</body></html>;
}
