import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    // Base config for source files
    files: ['src/**/*.ts'],
    ignores: ['src/**/*.spec.ts', 'src/tests/**/*'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
    },
  },
  {
    // Separate config for test files
    files: ['src/**/*.spec.ts', 'src/tests/**/*.ts'],
    ignores: [],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jasmine,
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.test.json',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/explicit-function-return-type': 'error',
      '@typescript-eslint/no-explicit-any': 'warn', // Relaxed for test files
      '@typescript-eslint/no-unused-vars': 'error',
    },
  }
);
