module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    serviceworker: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    // Disable some rules for .cjs files
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-redeclare': 'error',
    'no-undef': 'off', // TypeScript handles this
  },
  overrides: [
    {
      files: ['*.cjs', '*.js'],
      env: {
        node: true,
        commonjs: true,
      },
      rules: {
        'no-console': 'off',
        'no-unused-vars': 'off',
        'no-undef': 'off',
      },
    },
    {
      files: ['public/sw.js'],
      env: {
        serviceworker: true,
      },
      globals: {
        self: 'readonly',
        caches: 'readonly',
        fetch: 'readonly',
        Response: 'readonly',
        URL: 'readonly',
        clients: 'readonly',
      },
    },
    {
      files: ['*.tsx', '*.ts'],
      rules: {
        '@typescript-eslint/no-unused-vars': ['error', { 
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        }],
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '*.min.js',
    'api-server*.cjs',
    'production-server.cjs',
    'middleware/*.cjs',
    'api-tester.js',
  ],
};