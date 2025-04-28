module.exports = [
  // Ignore build and dependency folders
  { ignores: ['dist/**', 'node_modules/**'] },
  // Configuration for TypeScript files
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    rules: {},
  },
];