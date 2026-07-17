import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { markdownToHtml, mdxToJs, type MdastPluginInput } from 'satteri'
import { afterEach, expect, test, vi } from 'vitest'

import { AstroD2ConfigSchema } from '../config'
import { exec } from '../libs/exec'
import { applyMarkdownPlugin, type SatteriMarkdownProcessor } from '../libs/processor'
import { satteriAstroD2 } from '../libs/satteri'

import { TestD2Svg, TestDefaultDiagram, TestDefaultMd } from './utils'

vi.mock('../libs/exec')

vi.spyOn(fs, 'readFile').mockResolvedValue(TestD2Svg)

afterEach(() => {
  vi.clearAllMocks()
})

test('resets Sätteri diagram indexes between documents', async () => {
  const processor = { name: 'satteri', options: { mdastPlugins: [] } } as Parameters<typeof applyMarkdownPlugin>[0]

  applyMarkdownPlugin(processor, {
    ...AstroD2ConfigSchema.parse({}),
    base: '/',
    publicDir: new URL('public/', import.meta.url),
    root: new URL('..', import.meta.url),
  })

  const mdastPlugins = (processor as SatteriMarkdownProcessor).options.mdastPlugins as MdastPluginInput[]

  await markdownToHtml(TestDefaultMd, {
    fileURL: new URL('first.md', import.meta.url),
    mdastPlugins,
  })

  await markdownToHtml(TestDefaultMd, {
    fileURL: new URL('second.md', import.meta.url),
    mdastPlugins,
  })

  expect(exec).toHaveBeenNthCalledWith(
    1,
    'd2',
    expect.arrayContaining([fileURLToPath(new URL('public/d2/tests/first-0.svg', import.meta.url))]),
    TestDefaultDiagram,
    expect.any(String),
  )

  expect(exec).toHaveBeenNthCalledWith(
    2,
    'd2',
    expect.arrayContaining([fileURLToPath(new URL('public/d2/tests/second-0.svg', import.meta.url))]),
    TestDefaultDiagram,
    expect.any(String),
  )
})

test('preserves inline SVG markup', async () => {
  vi.mocked(fs.readFile).mockResolvedValueOnce(
    TestD2Svg.replace(
      'viewBox="-101 -101 128 64"></svg>',
      'viewBox="-101 -101 128 64"><style>\n.test { color: red; }\n</style></svg>',
    ),
  )

  const { html } = await markdownToHtml(TestDefaultMd, {
    fileURL: new URL('inline.md', import.meta.url),
    mdastPlugins: [
      satteriAstroD2({
        ...AstroD2ConfigSchema.parse({ inline: true }),
        base: '/',
        publicDir: new URL('public/', import.meta.url),
        root: new URL('..', import.meta.url),
      }),
    ],
  })

  expect(html).toContain('<style>\n.test { color: red; }\n</style>')
  expect(html).not.toContain('<p>')
})

test('preserves diagram markup in MDX', async () => {
  const { code } = await mdxToJs(TestDefaultMd, {
    fileURL: new URL('diagram.mdx', import.meta.url),
    jsx: true,
    mdastPlugins: [
      satteriAstroD2({
        ...AstroD2ConfigSchema.parse({}),
        base: '/',
        publicDir: new URL('public/', import.meta.url),
        root: new URL('..', import.meta.url),
      }),
    ],
  })

  expect(code).toContain(
    `return <Fragment set:html='<img alt="Diagram" decoding="async" loading="lazy" src="/d2/tests/diagram-0.svg" width="128" height="64" />' />;`,
  )
})
