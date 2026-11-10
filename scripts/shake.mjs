import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const work = join(tmpdir(), `vui-shake-${process.pid}`);
rmSync(work, { recursive: true, force: true });
mkdirSync(join(work, 'node_modules'), { recursive: true });
symlinkSync(root, join(work, 'node_modules', 'vui'), 'dir');

const cases = {
  reactButton: "export { Button } from 'vui/react';\n",
  reactAll: "export * from 'vui/react';\n",
  full: "import 'vui';\n",
  forms: "import 'vui/forms';\n",
  button: "import 'vui/button';\n",
};

for (const [name, source] of Object.entries(cases)) {
  writeFileSync(join(work, `${name}.ts`), source);
}

const sizes = {};
for (const name of Object.keys(cases)) {
  const outDir = join(work, 'dist', name);
  await build({
    root: work,
    configFile: false,
    logLevel: 'error',
    build: {
      outDir,
      emptyOutDir: true,
      minify: true,
      sourcemap: false,
      lib: {
        entry: join(work, `${name}.ts`),
        formats: ['es'],
        fileName: () => 'bundle.js',
      },
      rollupOptions: {
        external: ['lucide', 'react'],
      },
    },
  });
  const files = readdirSync(outDir).filter((file) => /\.(?:m?js)$/.test(file));
  sizes[name] = files.reduce((size, file) => size + statSync(join(outDir, file)).size, 0);
  if (name === 'reactButton') {
    const code = files.map((file) => readFileSync(join(outDir, file), 'utf8')).join('');
    if (code.includes('vui-data-grid') || !code.includes('vui-button') || !code.includes('customElements.define')) {
      throw new Error('React Button import retained unrelated components or lost its implementation');
    }
  }
}

if (!process.env.VUI_KEEP_SHAKE) rmSync(work, { recursive: true, force: true });
else console.log(`shake output: ${work}`);

const lines = Object.entries(sizes).map(([name, size]) => `${name} ${size}`);
console.log(lines.join('\n'));

if (!(sizes.button < sizes.forms && sizes.forms < sizes.full)) {
  console.error('selective import did not shrink the bundle: button < forms < full');
  process.exit(1);
}

if (!(sizes.reactButton < sizes.reactAll)) {
  throw new Error('React selective import did not shrink the complete bundle');
}
