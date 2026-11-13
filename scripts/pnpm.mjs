import { accessSync, constants } from 'node:fs';
import { delimiter, join } from 'node:path';
import { execFileSync, spawn } from 'node:child_process';
import process from 'node:process';

/** Resolve a pnpm executable that works with execFile/spawn on Windows. */
export function resolvePnpm() {
  const names = process.platform === 'win32' ? ['pnpm.cmd', 'pnpm.exe', 'pnpm'] : ['pnpm'];
  for (const directory of (process.env.PATH ?? '').split(delimiter)) {
    if (!directory) continue;
    for (const name of names) {
      const candidate = join(directory, name);
      try {
        accessSync(candidate, constants.F_OK);
        return candidate;
      } catch {
        /* try next */
      }
    }
  }
  return process.platform === 'win32' ? 'pnpm.cmd' : 'pnpm';
}

/** Windows .cmd shims require shell:true for execFile/spawn. */
function withShell(options = {}) {
  if (process.platform !== 'win32') return options;
  return { ...options, shell: true, windowsHide: true };
}

export function execPnpm(args, options = {}) {
  return execFileSync(resolvePnpm(), args, withShell(options));
}

export function spawnPnpm(args, options = {}) {
  return spawn(resolvePnpm(), args, withShell(options));
}
