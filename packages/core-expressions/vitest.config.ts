import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globals: true,
    environment: 'node'
  }
});
import { defineConfig } from 'vitest/config.js';
import rootConfig from './vitest.config.js';

export default defineConfig({
  ...rootConfig,
  test: {
    ...rootConfig.test,
    include: ['tests/**/*.spec.ts', 'tests/**/*.test.ts']
  }
});