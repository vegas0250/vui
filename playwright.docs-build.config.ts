import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/e2e', testMatch: 'documentation-build.spec.ts', workers: 1,
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:4174' },
  webServer: {
    command: 'pnpm exec vite preview --host 127.0.0.1 --port 4174 --strictPort',
    url: 'http://127.0.0.1:4174', reuseExistingServer: false,
  },
});
