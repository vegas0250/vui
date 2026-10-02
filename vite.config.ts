import { resolve } from 'node:path';
import { defineConfig } from 'vite';

const entries = [
  resolve('src/index.ts'),
  resolve('src/theme/index.ts'),
  resolve('src/foundation/index.ts'),
  resolve('src/contract/index.ts'),
  resolve('src/composition/index.ts'),
  resolve('src/families/index.ts'),
  resolve('src/components/foundation/icon.ts'),
  resolve('src/components/actions/button.ts'),
  resolve('src/components/actions/icon-button.ts'),
  resolve('src/components/forms/input.ts'),
  resolve('src/components/forms/checkbox.ts'),
  resolve('src/components/forms/switch.ts'),
  resolve('src/components/forms/select.ts'),
  resolve('src/components/overlay/dialog.ts'),
  resolve('src/components/overlay/menu.ts'),
  resolve('src/interaction/index.ts'),
  resolve('src/components/navigation/tabs.ts'),
  resolve('src/components/feedback/tooltip.ts'),
  resolve('src/components/feedback/alert.ts'),
  resolve('src/components/feedback/toast.ts'),
  resolve('src/components/layout/panel.ts'),
  resolve('src/components/layout/stack.ts'),
  resolve('src/components/layout/grid.ts'),
  resolve('src/components/layout/split-panel.ts'),
  resolve('src/components/navigation/toolbar.ts'),
  resolve('src/components/desktop/status-bar.ts'),
  resolve('src/components/desktop/file-tree.ts'),
  resolve('src/components/data/data-grid.ts'),
  resolve('src/categories/foundation.ts'),
  resolve('src/categories/layout.ts'),
  resolve('src/categories/actions.ts'),
  resolve('src/categories/forms.ts'),
  resolve('src/categories/feedback.ts'),
  resolve('src/categories/overlay.ts'),
  resolve('src/categories/navigation.ts'),
  resolve('src/categories/data.ts'),
  resolve('src/categories/desktop.ts'),
];

export default defineConfig(({ mode }) => {
  if (mode !== 'lib') {
    return {
      server: {
        host: true,
        port: 5173,
      },
    };
  }

  return {
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: entries,
        external: ['lucide'],
        preserveEntrySignatures: 'strict',
        output: {
          format: 'es',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
        },
      },
    },
  };
});
