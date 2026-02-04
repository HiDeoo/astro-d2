import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { D2, type CompileRequest } from '@terrastruct/d2'
import { remark } from 'remark'
import { VFile } from 'vfile'
import { afterEach, expect, test, vi } from 'vitest'

import { AstroD2ConfigSchema, type AstroD2UserConfig } from '../config'
import { remarkAstroD2, type RemarkAstroD2Config } from '../libs/remark'

const defaultProcessor = remark().use(remarkAstroD2, {
  ...AstroD2ConfigSchema.parse({}),
  base: '/',
  publicDir: new URL('public', import.meta.url),
  root: new URL('.', import.meta.url),
  experimental: { useD2js: true },
})
const defaultDiagram = 'x -> y'
const defaultMd = `\`\`\`d2
${defaultDiagram}
\`\`\`
`

const svg = vi.hoisted(
  () =>
    `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" d2Version="0.6.6" preserveAspectRatio="xMinYMin meet" viewBox="0 0 128 64"><svg id="d2-svg" class="d2-3990259979" width="128" height="64" viewBox="-101 -101 128 64"></svg></svg>`,
)

vi.mock(import('@terrastruct/d2'), () => {
  const D2 = vi.fn()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  D2.prototype.compile = vi.fn().mockResolvedValue({})
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  D2.prototype.render = vi.fn().mockResolvedValue(svg)
  return { D2 }
})

vi.spyOn(fs, 'readFile').mockResolvedValue(svg)
vi.spyOn(fs, 'writeFile').mockResolvedValue()

afterEach(() => {
  vi.clearAllMocks()
})

const d2 = new D2()

test('does nothing if the markdown does not contain any diagrams', async () => {
  const md = `test

\`\`\`js
console.warning('Hello, world!')
\`\`\`
`

  const result = await transformMd(md)

  expectD2jsToHaveBeenCalledTimes(0)

  expect(result).toBe(md)
})

test('generates a basic diagram', async () => {
  const result = await transformMd(defaultMd)

  expectD2jsToHaveBeenCalledTimes(1)
  expectD2jsToHaveBeenNthCalledWith(1, 0, defaultDiagram)

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

  expectD2jsToHaveBeenCalledTimes(2)
  expectD2jsToHaveBeenNthCalledWith(1, 0, defaultDiagram)
  expectD2jsToHaveBeenNthCalledWith(2, 1, 'y -> z')

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

  expectD2jsToHaveBeenNthCalledWith(1, 0, defaultDiagram, config)
})

test('uses the configured themes', async () => {
  const config = { theme: { dark: '301', default: '5' } }

  await transformMd(defaultMd, config)

  expectD2jsToHaveBeenNthCalledWith(1, 0, defaultDiagram, config)
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

  expect(vi.mocked(d2.compile).mock.lastCall?.[0].options.fontRegular).toBeDefined()

  expect(vi.mocked(d2.compile).mock.lastCall?.[0].options.fontItalic).toBeDefined()

  expect(vi.mocked(d2.compile).mock.lastCall?.[0].options.fontBold).toBeDefined()

  expect(vi.mocked(d2.compile).mock.lastCall?.[0].options.fontSemibold).toBeDefined()
})

test('uses a single theme if the dark theme is disabled', async () => {
  const config = { theme: { dark: false, default: '5' } } as const

  await transformMd(defaultMd, config)

  expectD2jsToNotHaveBeenCalledWithOption('darkThemeID')
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

  expectD2jsToHaveBeenNthCalledWith(1, 0, defaultDiagram, { theme: { dark: '8', default: '102' } })
})

test('uses the attributes to disable the dark theme if specified', async () => {
  await transformMd(`\`\`\`d2 darkTheme=false
${defaultDiagram}
\`\`\`
`)

  expectD2jsToNotHaveBeenCalledWithOption('darkThemeID')
})

test('uses the `sketch` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 sketch=true
${defaultDiagram}
\`\`\`
`)

  expectD2jsToHaveBeenCalledWithOption('sketch', true)
})

test('uses the `sketch` shorthand attribute if specified', async () => {
  await transformMd(`\`\`\`d2 sketch
${defaultDiagram}
\`\`\`
`)

  expectD2jsToHaveBeenCalledWithOption('sketch', true)
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

  expectD2jsToHaveBeenCalledWithOption('sketch', false)
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

  expectD2jsToHaveBeenCalledWithOption('sketch', true)
})

test('uses the `pad` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 pad=50
${defaultDiagram}
\`\`\`
`)

  expectD2jsToHaveBeenCalledWithOption('pad', 50)
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

  expectD2jsToHaveBeenCalledWithOption('pad', 25)
})

test('uses the `animateInterval` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 animateInterval=1000
${defaultDiagram}
\`\`\`
`)

  expectD2jsToHaveBeenCalledWithOption('animateInterval', 1000)
})

test('uses the `target` attribute if specified', async () => {
  await transformMd(`\`\`\`d2 target=test
${defaultDiagram}
\`\`\`
`)

  expectD2jsToHaveBeenCalledWithOption('target', 'test')
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

  expectD2jsToHaveBeenCalledWithOption('layout', 'tala')
})

test('uses the specified publicDir option', async () => {
  const astroConfig = { publicDir: new URL('my-custom-publicDir-directory/', import.meta.url) }

  await transformMd(defaultMd, {}, astroConfig)

  expectD2jsToHaveBeenNthCalledWith(1, 0, defaultDiagram, {}, astroConfig)
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

  expectD2jsToHaveBeenCalledWithOption('forceAppendix', true)
})

test('uses the `appendix` shorthand attribute if specified', async () => {
  await transformMd(`\`\`\`d2 appendix
${defaultDiagram}
\`\`\`
`)

  expectD2jsToHaveBeenCalledWithOption('forceAppendix', true)
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

  expectD2jsToNotHaveBeenCalledWithOption('forceAppendix')
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

  expectD2jsToHaveBeenCalledWithOption('forceAppendix', true)
})

async function transformMd(md: string, userConfig?: AstroD2UserConfig, astroConfig?: Partial<RemarkAstroD2Config>) {
  const processor = userConfig
    ? remark().use(remarkAstroD2, {
        ...AstroD2ConfigSchema.parse(userConfig),
        base: astroConfig?.base ?? '/',
        publicDir: astroConfig?.publicDir ?? new URL('public/', import.meta.url),
        root: new URL('.', import.meta.url),
        experimental: { useD2js: true },
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

function expectD2jsToHaveBeenCalledTimes(times: number) {
  expect(d2.compile).toHaveBeenCalledTimes(times)
  expect(d2.render).toHaveBeenCalledTimes(times)
}

function expectD2jsToHaveBeenNthCalledWith(
  nth: number,
  diagramIndex: number,
  input: string,
  userConfig: AstroD2UserConfig = {},
  astroConfig?: Partial<RemarkAstroD2Config>,
) {
  const config = AstroD2ConfigSchema.parse(userConfig)

  const path = fileURLToPath(
    astroConfig?.publicDir
      ? new URL(`${config.output}/tests/index-${diagramIndex}.svg`, astroConfig.publicDir)
      : new URL(`public/${config.output}/tests/index-${diagramIndex}.svg`, import.meta.url),
  )

  expect(d2.compile).toHaveBeenNthCalledWith(nth, {
    fs: { [path]: input },
    inputPath: path,
    options: {
      darkThemeID: Number.parseInt(config.theme.dark || '-1', 10),
      layout: config.layout,
      pad: config.pad,
      sketch: config.sketch,
      themeID: Number.parseInt(config.theme.default, 10),
    },
  })
}

function expectD2jsToNotHaveBeenCalledWithOption(name: keyof CompileRequest['options']) {
  expect(vi.mocked(d2.compile).mock.lastCall?.[0].options[name]).not.toBeDefined()
}

function expectD2jsToHaveBeenCalledWithOption(name: keyof CompileRequest['options'], value: unknown) {
  expect(vi.mocked(d2.compile).mock.lastCall?.[0].options[name]).toBe(value)
}
