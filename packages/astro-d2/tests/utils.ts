import { fileURLToPath } from 'node:url'

import { remark } from 'remark'
import { markdownToHtml } from 'satteri'
import { VFile } from 'vfile'

import { AstroD2ConfigSchema, type AstroD2UserConfig } from '../config'
import type { MarkdownAstroD2Config } from '../libs/markdown'
import { remarkAstroD2 } from '../libs/remark'
import { satteriAstroD2 } from '../libs/satteri'

export const TestDefaultDiagram = 'x -> y'
export const TestDefaultMd = `\`\`\`d2
${TestDefaultDiagram}
\`\`\`
`

export const TestD2Svg = `<?xml version="1.0" encoding="utf-8"?><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" d2Version="0.6.6" preserveAspectRatio="xMinYMin meet" viewBox="0 0 128 64"><svg id="d2-svg" class="d2-3990259979" width="128" height="64" viewBox="-101 -101 128 64"></svg></svg>`

export function getTestProcessors(config?: AstroD2UserConfig) {
  return [
    {
      name: 'unified',
      transformMd: (md: string, userConfig?: AstroD2UserConfig, astroConfig?: Partial<MarkdownAstroD2Config>) =>
        transformMdWithUnified(md, { ...config, ...userConfig }, astroConfig),
    },
    {
      name: 'satteri',
      transformMd: (md: string, userConfig?: AstroD2UserConfig, astroConfig?: Partial<MarkdownAstroD2Config>) =>
        transformMdWithSatteri(md, { ...config, ...userConfig }, astroConfig),
    },
  ]
}

async function transformMdWithUnified(
  md: string,
  userConfig?: AstroD2UserConfig,
  astroConfig?: Partial<MarkdownAstroD2Config>,
) {
  const processor = remark().use(remarkAstroD2, {
    ...AstroD2ConfigSchema.parse(userConfig ?? {}),
    base: astroConfig?.base ?? '/',
    publicDir: astroConfig?.publicDir ?? new URL('public', import.meta.url),
    root: new URL('..', import.meta.url),
  })

  const file = await processor.process(
    new VFile({
      cwd: fileURLToPath(new URL('..', import.meta.url)),
      path: fileURLToPath(new URL('index.md', import.meta.url)),
      value: md,
    }),
  )

  return String(file)
}

async function transformMdWithSatteri(
  md: string,
  userConfig?: AstroD2UserConfig,
  astroConfig?: Partial<MarkdownAstroD2Config>,
) {
  const { html } = await markdownToHtml(md, {
    fileURL: new URL('index.md', import.meta.url),
    mdastPlugins: [
      satteriAstroD2({
        ...AstroD2ConfigSchema.parse(userConfig),
        base: astroConfig?.base ?? '/',
        publicDir: astroConfig?.publicDir ?? new URL('public/', import.meta.url),
        root: new URL('..', import.meta.url),
      }),
    ],
  })

  return html
}
