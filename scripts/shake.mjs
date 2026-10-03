import { mkdirSync, rmSync, statSync, symlinkSync, writeFileSync } from 'node:fs';
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
        external: ['lucide'],
      },
    },
  });
  sizes[name] = statSync(join(outDir, 'bundle.js')).size;
}

rmSync(work, { recursive: true, force: true });

const lines = Object.entries(sizes).map(([name, size]) => `${name} ${size}`);
console.log(lines.join('\n'));

if (!(sizes.button < sizes.forms && sizes.forms < sizes.full)) {
  console.error('selective import did not shrink the bundle: button < forms < full');
  process.exit(1);
}
