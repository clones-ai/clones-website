import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default [
  { ignores: ['dist', 'node_modules', '*.config.js'] },

  // Configuration pour les scripts Node.js (performance-test.js, scripts/*)
  {
    files: ['scripts/**/*.js', 'performance-test.js', '*.config.js'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        process: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
      },
      sourceType: 'module',
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn', // Permettre les variables inutilisées dans les scripts
      'no-case-declarations': 'off', // Permettre les déclarations dans les case
    },
  },

  // Configuration pour les fichiers TypeScript/React
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.app.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // Règles de base JavaScript
      ...js.configs.recommended.rules,

      // Règles TypeScript recommandées
      ...tseslint.configs.recommended.rules,

      // Règles React Hooks
      ...reactHooks.configs.recommended.rules,

      // Règles React Refresh
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],

      // Désactiver les règles conflictuelles
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      'no-undef': 'off', // TypeScript gère cela
    },
  },

  // Configuration pour vite.config.ts et autres fichiers config TypeScript
  {
    files: ['vite.config.ts', '*.config.ts'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.node,
        process: 'readonly',
      },
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.node.json',
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
];
