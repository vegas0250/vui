import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url);
const dist = join(root.pathname, 'dist');
const fileLimit = 96 * 1024;
const totalLimit = 2 * 1024 * 1024;

function walk(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else if (name.endsWith('.js')) files.push(path);
  }
  return files;
}

const files = walk(dist);
let total = 0;
const overs = [];
for (const file of files) {
  const size = statSync(file).size;
  total += size;
  if (size > fileLimit) overs.push(`${file} ${size}`);
}

if (overs.length || total > totalLimit) {
  console.error(overs.join('\n') || `dist js ${total} exceeds ${totalLimit}`);
  process.exit(1);
}

console.log(`dist js files: ${files.length}, ${total} bytes`);
