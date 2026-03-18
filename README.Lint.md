# Lint Setup (Monorepo, ESLint 9 Flat Config)

This repository uses ESLint 9 flat config with a shared base:

- Base config factory: `eslint.base.cjs`
- Root config entry: `eslint.config.cjs`
- Root scripts: `pnpm lint`, `pnpm lint:fix`

## Goal

Use one strong default for all modules, and allow each module to add only local deltas.

## Base Config

`eslint.base.cjs` exports:

- `createBaseConfig(options)`

It includes:

- `@eslint/js` recommended
- `@typescript-eslint` recommended + type-checked rules
- `eslint-plugin-unused-imports`
- Optional `eslint-plugin-import` rules when installed
- Shared test globals and rules

## Root Config

The root `eslint.config.cjs` is intentionally small:

```js
const { createBaseConfig } = require('./eslint.base.cjs');

module.exports = createBaseConfig({
  tsconfigRootDir: __dirname,
});
```

## Module-Level Partial Config Example

If a module needs local adjustments, add an `eslint.config.cjs` inside that module and reuse the shared base.

Example: `packages/core-reactive/eslint.config.cjs`

```js
const { createBaseConfig } = require('../../eslint.base.cjs');

module.exports = [
  ...createBaseConfig({
    tsconfigRootDir: __dirname,
    extraIgnores: ['generated/**'],
    extraTypeScriptRules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  }),
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'error',
    },
  },
  {
    files: ['vitest.config.ts'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true,
      },
    },
    rules: {
      'no-console': 'off',
    },
  },
];
```

## When to Create a Module Config

Create a module config only when needed:

- Runtime-specific globals (Node-only, browser-only, worker-only)
- Stricter policy for one package
- Temporary migration exceptions
- Generated file paths that should be ignored locally

If not needed, rely on root config only.

## Commands

- Entire repo lint (memory-safe, split by workspace): `pnpm lint`
- Entire repo fix (memory-safe, split by workspace): `pnpm lint:fix`
- Packages only: `pnpm lint:packages`
- Applications only: `pnpm lint:apps`
- Single module lint: `pnpm --filter @monorepo/core-reactive run lint`
