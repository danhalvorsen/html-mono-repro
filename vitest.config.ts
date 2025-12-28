import { defineConfig } from 'vitest/config';

const moduleName = process.env.VITEST_MODULE;
const defaultInclude = [
  'test/**/*.test.ts',
  'tests/**/*.test.ts',
  'test/**/*.spec.ts',
  'tests/**/*.spec.ts',
  'packages/**/tests/**/*.test.ts',
  'packages/**/tests/**/*.spec.ts'
];

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: moduleName
      ? [
          `packages/${moduleName}/tests/**/*.test.ts`,
          `packages/${moduleName}/tests/**/*.spec.ts`
        ]
      : defaultInclude,
    coverage: { provider: 'v8' }
  }
});
