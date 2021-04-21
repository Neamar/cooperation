module.exports = {
  env: {
    node: true,
    es2020: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
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
