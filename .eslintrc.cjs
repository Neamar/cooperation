module.exports = {
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    sourceType: 'module',
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'prefer-template': 'error',
    'no-constant-condition': 0,
    camelcase: 0,
    'no-unused-vars': 'warn',
    'jest/expect-expect': 0,
    'jest/no-deprecated-functions': 0,
  },
};
