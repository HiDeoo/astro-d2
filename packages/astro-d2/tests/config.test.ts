import { expect, test } from 'vitest'

import { AstroD2ConfigSchema } from '../config'

test('throws an error when using the `tala` layout engine with D2.js', () => {
  const config = AstroD2ConfigSchema.safeParse({ experimental: { useD2js: true }, layout: 'tala' })

  expect(config.success).toBe(false)
  expect(config.error?.issues[0]?.message).toMatchInlineSnapshot(
    `"The \`tala\` layout engine is not supported when using the \`experimental.useD2js\` option."`,
  )
})
