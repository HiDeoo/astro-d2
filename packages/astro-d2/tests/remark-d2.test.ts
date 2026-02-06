import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { remark } from 'remark'
import { VFile } from 'vfile'
import { afterEach, expect, test, vi } from 'vitest'

import { AstroD2ConfigSchema, type AstroD2UserConfig } from '../config'
import { exec } from '../libs/exec'
import { remarkAstroD2, type RemarkAstroD2Config } from '../libs/remark'

const defaultProcessor = remark().use(remarkAstroD2, {
  ...AstroD2ConfigSchema.parse({}),
  base: '/',
  publicDir: new URL('public', import.meta.url),
  root: new URL('.', import.meta.url),
})
const defaultDiagram = 'x -> y'
const defaultMd = `\`\`\`d2
${defaultDiagram}
\`\`\`
`

vi.mock('../libs/exec')
vi.spyOn(fs, 'readFile').mockResolvedValue(
  `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" d2Version="0.6.6" preserveAspectRatio="xMinYMin meet" viewBox="0 0 128 64"><svg id="d2-svg" class="d2-3990259979" width="128" height="64" viewBox="-101 -101 128 64"></svg></svg>`,
)

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

test('uses the configured layout engine', async () => {
  const config = { layout: 'elk' } as const

  await transformMd(defaultMd, config)

  expectD2ToHaveBeenNthCalledWith(1, 0, defaultDiagram, config)
})

test('uses the configured themes', async () => {
  const config = { theme: { dark: '301', default: '5' } }

  await transformMd(defaultMd, config)

  expectD2ToHaveBeenNthCalledWith(1, 0, defaultDiagram, config)
})

test('uses the configured fonts', async () => {
  const config = {
    fonts: {
      regular: './fonts/regular.ttf',
      italic: './fonts/italic.ttf',
      bold: './fonts/bold.ttf',
      semibold: './fonts/semibold.ttf',
    },
  }

  await transformMd(defaultMd, config)

  expect(
    vi.mocked(exec).mock.lastCall?.[1].some((arg) => {
      return /--font-regular=fonts[/\\]regular\.ttf/.test(arg)
    }),
  ).toBe(true)

  expect(
    vi.mocked(exec).mock.lastCall?.[1].some((arg) => {
      return /--font-italic=fonts[/\\]italic\.ttf/.test(arg)
    }),
  ).toBe(true)

  expect(
    vi.mocked(exec).mock.lastCall?.[1].some((arg) => {
      return /--font-bold=fonts[/\\]bold\.ttf/.test(arg)
    }),
  ).toBe(true)

  expect(
    vi.mocked(exec).mock.lastCall?.[1].some((arg) => {
      return /--font-semibold=fonts[/\\]semibold\.ttf/.test(arg)
    }),
  ).toBe(true)
})

test('uses a single theme if the dark theme is disabled', async () => {
  const config = { theme: { dark: false, default: '5' } } as const

  await transformMd(defaultMd, config)

  expectD2ToNotHaveBeenCalledWithArg('--dark-theme')
})

test('uses title from attributes', async () => {
  const result = await transformMd(`\`\`\`d2 title="Test Diagram"
${defaultDiagram}
\`\`\`
`)

  expect(result).toMatchInlineSnapshot(`
    "<img alt="Test Diagram" decoding="async" loading="lazy" src="/d2/tests/index-0.svg" width="128" height="64" />
    "
  `)
})

test('uses the themes specified in the attributes if any', async () => {
  await transformMd(`\`\`\`d2 theme=102 darkTheme=8
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenNthCalledWith(1, 0, defaultDiagram, { theme: { dark: '8', default: '102' } })
})

test('uses the attributes to disable the dark theme if specified', async () => {
  await transformMd(`\`\`\`d2 darkTheme=false
${defaultDiagram}
\`\`\`
`)

  expectD2ToNotHaveBeenCalledWithArg('--dark-theme')
})

test('uses the `sketch` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 sketch=true
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenCalledWithArg('--sketch=true')
})

test('uses the `sketch` shorthand attribute if specified', async () => {
  await transformMd(`\`\`\`d2 sketch
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenCalledWithArg('--sketch=true')
})

test('uses the `sketch` attribute to disable the `sketch` config if specified', async () => {
  const config = { sketch: true }

  await transformMd(
    `\`\`\`d2 sketch=false
${defaultDiagram}
\`\`\`
`,
    config,
  )

  expectD2ToHaveBeenCalledWithArg('--sketch=false')
})

test('uses the `sketch` attribute to enable the `sketch` config if specified', async () => {
  const config = { sketch: false }

  await transformMd(
    `\`\`\`d2 sketch
${defaultDiagram}
\`\`\`
`,
    config,
  )

  expectD2ToHaveBeenCalledWithArg('--sketch=true')
})

test('uses the `pad` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 pad=50
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenCalledWithArg('--pad=50')
})

test('uses the `pad` attribute to override the `pad` config if specified', async () => {
  const config = { pad: 200 }

  await transformMd(
    `\`\`\`d2 pad=25
${defaultDiagram}
\`\`\`
`,
    config,
  )

  expectD2ToHaveBeenCalledWithArg('--pad=25')
})

test('uses the `animateInterval` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 animateInterval=1000
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenCalledWithArg('--animate-interval=1000')
})

test('uses the `target` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 target=test
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenCalledWithArg('--target=test')
})

test('uses the `width` attribute if specified and computes the height', async () => {
  const result = await transformMd(`\`\`\`d2 width=100
${defaultDiagram}
\`\`\`
`)

  expect(result).toMatchInlineSnapshot(`
    "<img alt="Diagram" decoding="async" loading="lazy" src="/d2/tests/index-0.svg" width="100" height="50" />
    "
  `)
})

test('uses the specified base option', async () => {
  const result = await transformMd(defaultMd, {}, { base: '/test' })

  expect(result).toMatchInlineSnapshot(`
    "<img alt="Diagram" decoding="async" loading="lazy" src="/test/d2/tests/index-0.svg" width="128" height="64" />
    "
  `)
})

test('uses the `layout` attribute to override the `layout` config if specified', async () => {
  await transformMd(
    `\`\`\`d2 layout=tala
${defaultDiagram}
\`\`\`
`,
    { layout: 'elk' },
  )

  expectD2ToHaveBeenCalledWithArg('--layout=tala')
})

test('uses the specified publicDir option', async () => {
  const astroConfig = { publicDir: new URL('my-custom-publicDir-directory/', import.meta.url) }

  await transformMd(defaultMd, {}, astroConfig)

  expectD2ToHaveBeenNthCalledWith(1, 0, defaultDiagram, {}, astroConfig)
})

test('inlines SVGs if the `inline` config is set', async () => {
  const result = await transformMd(defaultMd, { inline: true })

  expect(result).toMatchInlineSnapshot(`
    "<!--?xml version="1.0" encoding="utf-8"?--><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" d2version="0.6.6" preserveAspectRatio="xMinYMin meet" viewBox="0 0 128 64"><title>Diagram</title><svg id="d2-svg" class="d2-3990259979" width="128" height="64" viewBox="-101 -101 128 64"></svg></svg>
    "
  `)
})

test('inlines SVGs if the `inline` attribute is specified', async () => {
  const result = await transformMd(
    `\`\`\`d2 inline
    ${defaultDiagram}
    \`\`\`
    `,
  )

  expect(result).toMatchInlineSnapshot(`
    "<!--?xml version="1.0" encoding="utf-8"?--><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" d2version="0.6.6" preserveAspectRatio="xMinYMin meet" viewBox="0 0 128 64"><title>Diagram</title><svg id="d2-svg" class="d2-3990259979" width="128" height="64" viewBox="-101 -101 128 64"></svg></svg>
    "
  `)
})

test('uses the `title` attribute if specified for inline SVGs', async () => {
  const result = await transformMd(
    `\`\`\`d2 title="Test Diagram"
    ${defaultDiagram}
    \`\`\`
    `,
    { inline: true },
  )

  expect(result).toMatchInlineSnapshot(`
    "<!--?xml version="1.0" encoding="utf-8"?--><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" d2version="0.6.6" preserveAspectRatio="xMinYMin meet" viewBox="0 0 128 64"><title>Test Diagram</title><svg id="d2-svg" class="d2-3990259979" width="128" height="64" viewBox="-101 -101 128 64"></svg></svg>
    "
  `)
})

test('sets the width and height attributes if the `width` attribute is set for inline SVGs', async () => {
  const result = await transformMd(
    `\`\`\`d2 width=100
    ${defaultDiagram}
    \`\`\`
    `,
    { inline: true },
  )

  expect(result).toMatchInlineSnapshot(`
    "<!--?xml version="1.0" encoding="utf-8"?--><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" d2version="0.6.6" preserveAspectRatio="xMinYMin meet" viewBox="0 0 128 64" width="100" height="50"><title>Diagram</title><svg id="d2-svg" class="d2-3990259979" width="128" height="64" viewBox="-101 -101 128 64"></svg></svg>
    "
  `)
})

test('uses the `appendix` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 appendix=true
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenCalledWithArg('--force-appendix')
})

test('uses the `appendix` shorthand attribute if specified', async () => {
  await transformMd(`\`\`\`d2 appendix
${defaultDiagram}
\`\`\`
`)

  expectD2ToHaveBeenCalledWithArg('--force-appendix')
})

test('uses the `appendix` attribute to disable the `appendix` config if specified', async () => {
  const config = { appendix: true }

  await transformMd(
    `\`\`\`d2 appendix=false
${defaultDiagram}
\`\`\`
`,
    config,
  )

  expectD2ToNotHaveBeenCalledWithArg('--force-appendix')
})

test('uses the `appendix` attribute to enable the `appendix` config if specified', async () => {
  const config = { appendix: false }

  await transformMd(
    `\`\`\`d2 appendix
${defaultDiagram}
\`\`\`
`,
    config,
  )

  expectD2ToHaveBeenCalledWithArg('--force-appendix')
})

async function transformMd(md: string, userConfig?: AstroD2UserConfig, astroConfig?: Partial<RemarkAstroD2Config>) {
  const processor = userConfig
    ? remark().use(remarkAstroD2, {
        ...AstroD2ConfigSchema.parse(userConfig),
        base: astroConfig?.base ?? '/',
        publicDir: astroConfig?.publicDir ?? new URL('public/', import.meta.url),
        root: new URL('.', import.meta.url),
      })
    : defaultProcessor

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
  astroConfig?: Partial<RemarkAstroD2Config>,
) {
  const config = AstroD2ConfigSchema.parse(userConfig)

  expect(exec).toHaveBeenNthCalledWith(
    nth,
    'd2',
    [
      `--layout=${config.layout}`,
      `--theme=${config.theme.default}`,
      `--sketch=${config.sketch}`,
      `--pad=${config.pad}`,
      `--dark-theme=${config.theme.dark}`,
      '-',
      fileURLToPath(
        astroConfig?.publicDir
          ? new URL(`${config.output}/tests/index-${diagramIndex}.svg`, astroConfig.publicDir)
          : new URL(`public/${config.output}/tests/index-${diagramIndex}.svg`, import.meta.url),
      ),
    ],
    input,
    expect.stringMatching(/astro-d2[/\\]packages[/\\]astro-d2[/\\]tests$/),
  )
}

function expectD2ToNotHaveBeenCalledWithArg(excludedArg: string) {
  expect(vi.mocked(exec).mock.lastCall?.[1].every((arg) => !arg.includes(excludedArg))).toBe(true)
}

function expectD2ToHaveBeenCalledWithArg(includedArg: string) {
  expect(vi.mocked(exec).mock.lastCall?.[1].some((arg) => arg.includes(includedArg))).toBe(true)
}
