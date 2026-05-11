const js = require('@eslint/js');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const unusedImports = require('eslint-plugin-unused-imports');

let importPlugin = null;
try {
  importPlugin = require('eslint-plugin-import');
} catch {
  importPlugin = null;
}

const typeCheckedRules =
  tsPlugin.configs['recommended-type-checked']?.rules ??
  tsPlugin.configs['recommended-requiring-type-checking']?.rules ??
  {};

function createBaseConfig(options = {}) {
  const {
    tsconfigRootDir = __dirname,
    extraIgnores = [],
    extraRules = {},
    extraTypeScriptRules = {},
    extraTestRules = {},
    includeImportRules = true,
  } = options;

  const importRules =
    includeImportRules && importPlugin
      ? {
          'import/no-extraneous-dependencies': [
            'error',
            { devDependencies: ['**/test/**', '**/*.test.*', 'tests/**'] },
          ],
        }
      : {};

  return [
    {
      ignores: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.pnp.js',
        '**/.pnp.cjs',
        '**/.vscode/**',
        '**/*.d.ts',
        ...extraIgnores,
      ],
    },
    js.configs.recommended,
    {
      files: ['**/*.{js,cjs,mjs,ts,tsx}'],
      languageOptions: {
        ecmaVersion: 2024,
        sourceType: 'module',
        globals: {
          console: 'readonly',
          setTimeout: 'readonly',
          clearTimeout: 'readonly',
          setInterval: 'readonly',
          clearInterval: 'readonly',
          process: 'readonly',
          module: 'readonly',
          require: 'readonly',
          __dirname: 'readonly',
          __filename: 'readonly',
          global: 'readonly',
          window: 'readonly',
          document: 'readonly',
          navigator: 'readonly',
          fetch: 'readonly',
        },
      },
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error'] }],
        'prefer-const': 'warn',
        ...extraRules,
      },
    },
    {
      files: ['**/*.{ts,tsx}'],
      languageOptions: {
        parser: tsParser,
        parserOptions: {
          projectService: true,
          tsconfigRootDir,
        },
      },
      plugins: {
        '@typescript-eslint': tsPlugin,
        'unused-imports': unusedImports,
        ...(importPlugin ? { import: importPlugin } : {}),
      },
      rules: {
        ...tsPlugin.configs.recommended.rules,
        ...typeCheckedRules,
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
        'unused-imports/no-unused-imports': 'warn',
        '@typescript-eslint/no-floating-promises': 'error',
        '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
        '@typescript-eslint/strict-boolean-expressions': 'warn',
        '@typescript-eslint/prefer-readonly': 'warn',
        '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: false }],
        '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          {
            prefer: 'type-imports',
            fixStyle: 'inline-type-imports',
          },
        ],
        '@typescript-eslint/no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@monorepo/*/src/*'],
                message: 'Do not import another package src folder. Use the package public export.',
              },
              {
                group: [
                  '../../packages/*',
                  '../../../packages/*',
                  '../../../../packages/*',
                  '../../Applications/*',
                  '../../../Applications/*',
                  '../../../../Applications/*',
                ],
                message: 'Cross-package imports must use package names, not relative paths.',
              },
            ],
          },
        ],
        ...importRules,
        ...extraTypeScriptRules,
      },
    },
    {
      files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}', '**/__tests__/**'],
      languageOptions: {
        globals: {
          describe: 'readonly',
          it: 'readonly',
          test: 'readonly',
          expect: 'readonly',
          beforeAll: 'readonly',
          beforeEach: 'readonly',
          afterAll: 'readonly',
          afterEach: 'readonly',
          jest: 'readonly',
        },
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        ...extraTestRules,
      },
    },
  ];
}

module.exports = {
  createBaseConfig,
};
