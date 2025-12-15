import { defineConfig } from 'vitest/config';
import rootConfig from '../vitest.config.js';

export default defineConfig({
  ...rootConfig,
  test: {
    ...rootConfig.test,
    include: ['tests/**/*.test.ts']
  }
});
