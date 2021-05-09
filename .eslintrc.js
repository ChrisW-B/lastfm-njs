const path = require('path');

module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'airbnb-base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:prettier/recommended',
  ],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    ecmaVersion: 2018,
    sourceType: 'module',
    project: path.join(__dirname, 'tsconfig.json'),
  },
  env: {
    jest: true,
    es6: true,
    commonjs: true,
    node: true,
  },
  settings: {
    react: { version: 'detect' },
    'import/parsers': { '@typescript-eslint/parser': ['.ts', '.tsx'] },
    'import/resolver': { typescript: { alwaysTryTypes: true } },
  },
  rules: {
    'no-underscore-dangle': 'off',
    'import/extensions': ['error', { ts: 'never', json: 'always' }],
    'lines-between-class-members': 'off',
    'no-dupe-class-members': 'off',
    'no-nested-ternary': 'off',
    'no-prototype-builtins': 'off',
    'no-underscore-dangle': 'off',
    'prefer-promise-reject-errors': 'off',
    camelcase: 'off',
  },
};
