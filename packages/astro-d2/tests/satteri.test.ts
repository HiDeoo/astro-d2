import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { markdownToHtml, type MdastPluginInput } from 'satteri'
import { afterEach, expect, test, vi } from 'vitest'

import { AstroD2ConfigSchema } from '../config'
import { exec } from '../libs/exec'
import { applyMarkdownPlugin, type SatteriMarkdownProcessor } from '../libs/processor'

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
