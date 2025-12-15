import { defineConfig } from 'vitest/config';
import rootConfig from '../../../vitest.config.js'; // compiled version of packages/vitest.config.ts

export default defineConfig({
  // ...reuse root settings...
  ...(rootConfig as any),
  test: {
    ...(rootConfig as any).test,
    root: __dirname,
    include: ['test/**/*.test.ts']
  }
});
