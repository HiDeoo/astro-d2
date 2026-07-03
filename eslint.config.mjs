import hideoo from '@hideoo/eslint-config'

export default hideoo({
  files: ['packages/astro-d2/tests/markdown-d2js.test.ts'],
  rules: {
    '@typescript-eslint/unbound-method': 'off',
  },
})
