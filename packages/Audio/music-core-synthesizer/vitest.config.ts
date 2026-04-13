import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts'],
    coverage: {
      include: [
        'src/**/*.ts',
      ],
      exclude: [
        'dist/**',
        'tests/**',
        'vitest.config.ts',
        'src/generated/**',
        'src/**/I*.ts',
        'src/dto.ts',
        'src/sequencer-statefull/**',
        'src/**/for.ai.spec.md',
        'src/**/*.d.ts',
        'scripts/**',
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
