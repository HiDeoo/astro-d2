import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { remark } from 'remark'
import { VFile } from 'vfile'
import { afterEach, expect, test, vi } from 'vitest'

import { AstroD2ConfigSchema, type AstroD2UserConfig } from '../config'
import { exec } from '../libs/exec'
import { remarkAstroD2 } from '../libs/remark'

const defaultProcessor = remark().use(remarkAstroD2, AstroD2ConfigSchema.parse({}))
const defaultDiagram = 'x -> y'
const defaultMd = `\`\`\`d2
${defaultDiagram}
\`\`\`
`

vi.mock('../libs/exec')
vi.spyOn(fs, 'readFile').mockResolvedValue(`<?xml viewBox="0 0 128 64">`)

afterEach(() => {
  vi.clearAllMocks()
})

test('does nothing if the markdown does not contain any diagrams', async () => {
  const md = `test

\`\`\`js
console.warning('Hello, world!')
\`\`\`
`

  const result = await transformMd(md)

  expectD2ToHaveBeenCalledTimes(0)

  expect(result).toBe(md)
})

test('generates a basic diagram', async () => {
  const result = await transformMd(defaultMd)

  expectD2ToHaveBeenCalledTimes(1)
  expectD2ToHaveBeenNthCalledWith(1, 0, defaultDiagram)

  expect(result).toMatchInlineSnapshot(`
    "<img alt="Diagram" decoding="async" loading="lazy" src="/d2/tests/index-0.svg" width="128" height="64" />
    "
  `)
})

test('generates multiple diagrams in the same file', async () => {
  const result = await transformMd(`test 1

${defaultMd}

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

    <img alt="Diagram" decoding="async" loading="lazy" src="/d2/tests/index-0.svg" width="128" height="64" />

    test 2

    <img alt="Diagram" decoding="async" loading="lazy" src="/d2/tests/index-1.svg" width="128" height="64" />
    "
  `)
})

test('uses the configured themes', async () => {
  const config = { theme: { dark: '301', default: '5' } }

  await transformMd(defaultMd, config)

  expectD2ToHaveBeenNthCalledWith(1, 0, defaultDiagram, config)
})

test('uses a single theme if the dark theme is disabled', async () => {
  const config = { theme: { dark: false, default: '5' } } as const

  await transformMd(defaultMd, config)

  expect(vi.mocked(exec).mock.lastCall?.[1].every((arg) => !arg.includes('--dark-theme'))).toBe(true)
})

test('uses title from meta', async () => {
  const result = await transformMd(`\`\`\`d2 title="Test Diagram"
${defaultDiagram}
\`\`\`
`)

  expect(result).toMatchInlineSnapshot(`
    "<img alt="Test Diagram" decoding="async" loading="lazy" src="/d2/tests/index-0.svg" width="128" height="64" />
    "
  `)
})

async function transformMd(md: string, userConfig?: AstroD2UserConfig) {
  const processor = userConfig ? remark().use(remarkAstroD2, AstroD2ConfigSchema.parse(userConfig)) : defaultProcessor

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
  userConfig: AstroD2UserConfig = {},
) {
  const config = AstroD2ConfigSchema.parse(userConfig)

  expect(exec).toHaveBeenNthCalledWith(
    nth,
    'd2',
    [
      `--theme=${config.theme.default}`,
      `--dark-theme=${config.theme.dark}`,
      '-',
      fileURLToPath(new URL(`../public/${config.output}/tests/index-${diagramIndex}.svg`, import.meta.url)),
    ],
    input,
  )
}
