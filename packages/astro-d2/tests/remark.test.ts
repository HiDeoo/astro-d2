import { fileURLToPath } from 'node:url'

import { remark } from 'remark'
import { VFile } from 'vfile'
import { afterEach, expect, test, vi } from 'vitest'

import { AstroD2ConfigSchema, type AstroD2Config } from '../config'
import { exec } from '../libs/exec'
import { remarkAstroD2 } from '../libs/remark'

const defaultConfig = AstroD2ConfigSchema.parse({})
const defaultProcessor = remark().use(remarkAstroD2, defaultConfig)
const defaultDiagram = 'x -> y'

vi.mock('../libs/exec')

afterEach(() => {
  vi.clearAllMocks()
})

test('does nothing if the markdown does not contain any diagrams', async () => {
  const md = `test

\`\`\`js
console.log('Hello, world!')
\`\`\`
`

  const result = await transformMd(md)

  expectD2ToHaveBeenCalledTimes(0)

  expect(result).toBe(md)
})

test('generates a basic diagram', async () => {
  const result = await transformMd(`\`\`\`d2
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenCalledTimes(1)
  expectD2ToHaveBeenNthCalledWith(1, 0, defaultDiagram)

  expect(result).toMatchInlineSnapshot(`
    "<img src="/d2/tests/index-0.svg" />
    "
  `)
})

test('generates multiple diagrams in the same file', async () => {
  const result = await transformMd(`test 1

\`\`\`d2
${defaultDiagram}
\`\`\`

test 2

\`\`\`d2
y -> z
\`\`\`
`)

  expectD2ToHaveBeenCalledTimes(2)
  expectD2ToHaveBeenNthCalledWith(1, 0, defaultDiagram)
  expectD2ToHaveBeenNthCalledWith(2, 1, 'y -> z')

  expect(result).toMatchInlineSnapshot(`
    "test 1

    <img src="/d2/tests/index-0.svg" />

    test 2

    <img src="/d2/tests/index-1.svg" />
    "
  `)
})

async function transformMd(md: string, config?: AstroD2Config) {
  const processor = config ? remark().use(remarkAstroD2, AstroD2ConfigSchema.parse(config)) : defaultProcessor

  const file = await processor.process(
    new VFile({
      path: fileURLToPath(new URL('index.md', import.meta.url)),
      value: md,
    }),
  )

  return String(file)
}

function expectD2ToHaveBeenCalledTimes(times: number) {
  expect(exec).toHaveBeenCalledTimes(times)
}

function expectD2ToHaveBeenNthCalledWith(
  nth: number,
  diagramIndex: number,
  input: string,
  config: AstroD2Config = defaultConfig,
) {
  expect(exec).toHaveBeenNthCalledWith(
    nth,
    'd2',
    ['-', fileURLToPath(new URL(`../public/${config.output}/tests/index-${diagramIndex}.svg`, import.meta.url))],
    input,
  )
}
