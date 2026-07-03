import { fileURLToPath } from 'node:url'

import { defineMdastPlugin, type MdastPluginDefinition } from 'satteri'

import { renderD2Node, type MarkdownAstroD2Config } from './markdown'

export function satteriAstroD2(config: MarkdownAstroD2Config): MdastPluginDefinition {
  let d2Index = 0

  return defineMdastPlugin({
    name: 'astro-d2',
    async code(node, ctx) {
      if (!ctx.fileURL) return
      if (node.lang !== 'd2') return

      const path = fileURLToPath(ctx.fileURL)
      const htmlNode = await renderD2Node(config, node, { cwd: fileURLToPath(config.root), path }, d2Index++)

      return { rawHtml: htmlNode.value }
    },
  })
}
