// Canonical Vitest 4 config shared by all packages.
// NOTE: Keep this file stable to avoid large lockfile/config diffs.
// Per-package runs rely on CWD + `include: ['test/**/*.test.ts']`.

const config = {
  // Set a default root for tests; per-package runs can override CWD,
  // but this keeps patterns simple.
  root: process.cwd(),
  test: {
    globals: true,
    environment: 'node',
    runner: 'node',
    pool: 'forks',
    isolate: true,
    // Only look for tests in "test/**/*.test.ts" under the current root
    include: ['test/**/*.test.ts'],
  },
  server: {
    deps: {
      external: [],
      interopDefault: false,
    },
  },
  resolve: {
    alias: {},
    preserveSymlinks: true,
    dedupe: [],
  },
  optimizeDeps: {
    disabled: true,
  },
};

export default config;