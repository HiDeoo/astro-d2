import type { Code, Parent, Root } from 'mdast'
import { SKIP, visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

import { renderD2Node, type MarkdownAstroD2Config } from './markdown'

export function remarkAstroD2(config: MarkdownAstroD2Config) {
  return async function transformer(tree: Root, file: VFile) {
    const d2Nodes: [node: Code, context: VisitorContext][] = []

    visit(tree, 'code', (node, index, parent) => {
      if (node.lang === 'd2') {
        d2Nodes.push([node, { index, parent }])
      }

      return SKIP
    })

    if (d2Nodes.length === 0) {
      return
    }

    await Promise.all(
      d2Nodes.map(async ([node, { index, parent }], d2Index) => {
        const htmlNode = await renderD2Node(
          config,
          node,
          { cwd: file.cwd, path: file.history[0] ?? file.path },
          d2Index,
        )

        if (parent && index !== undefined) {
          parent.children.splice(index, 1, htmlNode)
        }
      }),
    )
  }
}

interface VisitorContext {
  index: number | undefined
  parent: Parent | undefined
}
