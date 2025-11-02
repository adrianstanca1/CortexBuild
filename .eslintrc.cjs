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
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    'no-redeclare': 'error',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  globals: {
    process: 'readonly',
    __dirname: 'readonly',
    console: 'readonly',
    URL: 'readonly',
    fetch: 'readonly',
    caches: 'readonly',
    self: 'readonly',
    Response: 'readonly',
    clients: 'readonly',
    setTimeout: 'readonly',
    setInterval: 'readonly',
    clearInterval: 'readonly',
  }
};