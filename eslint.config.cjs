const globals = require("globals");
const tsParser = require("@typescript-eslint/parser");
const eslintPluginReact = require("eslint-plugin-react");
const eslintPluginReactHooks = require("eslint-plugin-react-hooks");
const eslintPluginTypeScript = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    ignores: ["scripts/", "public/", "*.cjs", "api-tester.js"],
  },
  {
    files: ["**/*.{js,mjs,cjs,jsx,mjsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
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
      },
    },
    rules: {
        'no-console': 'off',
        'no-unused-vars': 'off',
        'no-redeclare': 'error',
    },
  },
  {
    files: ["**/*.{ts,tsx,mts,mtsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.serviceworker,
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
      },
    },
    plugins: {
      react: eslintPluginReact,
      "react-hooks": eslintPluginReactHooks,
      "@typescript-eslint": eslintPluginTypeScript,
    },
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
  },
];