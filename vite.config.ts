import pkg from './package.json';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { themeBootScript } from './src/showcase/boot';

// The export map is the source of truth for production entry points.
const entries = [...new Set(Object.values(pkg.exports).flatMap((entry) =>
  typeof entry === 'object' && entry.import.endsWith('.js')
    ? [resolve(entry.import.replace('./dist/', 'src/').replace(/\.js$/, '.ts'))]
    : [],
))];

export default defineConfig(({ mode }) => {
  if (mode !== 'lib') {
    return {
      base: './',
      plugins: [{
        name: 'vui-initial-theme',
        configureServer(server) {
          server.middlewares.use('/theme-boot.js', (_request, response) => {
            response.setHeader('Content-Type', 'text/javascript');
            response.end(themeBootScript());
          });
        },
        generateBundle() {
          this.emitFile({ type: 'asset', fileName: 'theme-boot.js', source: themeBootScript() });
        },
        transformIndexHtml: {
          order: 'post' as const,
          handler: (_html, context) => context.filename.endsWith('/index.html')
            ? [{tag: 'script', attrs: {src: './theme-boot.js'}, injectTo: 'head-prepend' as const}]
            : [],
        },
      }],
      build: {outDir: 'dist-docs', emptyOutDir: true},
      server: {
        host: true,
        port: 5173,
        watch: {ignored: ['**/.pnpm-store/**', '**/test-results/**', '**/dist/**', '**/dist-docs/**']},
      },
    };
  }

  return {
    build: {
      outDir: 'dist',
      lib: { entry: entries, formats: ['es'] },
      // Keep published modules readable and preserve pure annotations.
      minify: false,
      emptyOutDir: true,
      sourcemap: true,
      rollupOptions: {
        input: entries,
        onwarn(warning, warn) {
          if (warning.code === 'MODULE_LEVEL_DIRECTIVE' && warning.message.includes('use client')) return;
          warn(warning);
        },
        external: ['lucide', 'react'],
        preserveEntrySignatures: 'strict',
        output: {
          format: 'es',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].js',
          // Rollup removes module directives; keep the boundary on every adapter.
          banner: (chunk) => chunk.facadeModuleId?.endsWith('.react.ts') || chunk.facadeModuleId?.endsWith('/react.ts')
            ? '"use client";' : '',
          chunkFileNames: '[name].js',
        },
      },
    },
  };
});
