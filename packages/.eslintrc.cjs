const tryResolve = (pkg) => {
  try {
    require.resolve(pkg);
    return true;
  } catch {
    return false;
  }
};

const hasImportPlugin = tryResolve('eslint-plugin-import');

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2024,
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    // Point to root and package tsconfigs in monorepo; adjust if your layout differs
    project: ['./tsconfig.json', './packages/*/tsconfig.json', './*/tsconfig.json']
  },
  plugins: [
    '@typescript-eslint',
    'unused-imports',
    // only add 'import' if it's actually installed
    ...(hasImportPlugin ? ['import'] : [])
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    // only extend import plugin rules when available
    ...(hasImportPlugin ? ['plugin:import/errors', 'plugin:import/warnings', 'plugin:import/typescript'] : []),
    'prettier'
  ],
  settings: {
    // typescript resolver is safe to leave even if plugin not present
    'import/resolver': {
      typescript: {} // allow resolving TS path aliases and .ts/.tsx imports
    }
  },
  env: {
    node: true,
    es2024: true,
    browser: true
  },
  rules: {
    // General cleanup
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'unused-imports/no-unused-imports': 'warn',

    // TypeScript best-practices
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
    '@typescript-eslint/strict-boolean-expressions': 'warn',
    '@typescript-eslint/prefer-readonly': 'warn',
    '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: false }],
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],

    // Import rules
    // let import plugin handle unresolved imports if present; otherwise skip the rule
    ...(hasImportPlugin ? {} : { 'import/no-unresolved': 'off' }),
    'import/no-extraneous-dependencies': ['error', { devDependencies: ['**/test/**', '**/*.test.*', 'tests/**'] }],

    // stylistic choices (use Prettier for formatting)
    'prefer-const': 'warn'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parserOptions: {
        // use same project setting; needed for some type-aware rules
        project: ['./tsconfig.json', './packages/*/tsconfig.json', './*/tsconfig.json']
      }
    },
    {
      files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**'],
      env: { jest: true },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ]
};
