import path from 'node:path'

import type { Code, Html, Parent, Root } from 'mdast'
import { SKIP, visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

import type { AstroD2Config } from '../config'

import { type DiagramAttributes, getAttributes } from './attributes'
import { generateD2Diagram, type D2Size, getD2DiagramSize } from './d2'
import { throwErrorWithHint } from './integration'

export function remarkAstroD2(config: AstroD2Config) {
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
        const outputPath = getOutputPaths(config, file, d2Index)
        const attributes = getAttributes(node.meta)
        let size: D2Size = undefined

        if (config.skipGeneration) {
          size = await getD2DiagramSize(outputPath.fsPath)
        } else {
          try {
            size = await generateD2Diagram(config, attributes, node.value, outputPath.fsPath)
          } catch {
            throwErrorWithHint(
              `Failed to generate the D2 diagram at ${node.position?.start.line ?? 0}:${node.position?.start.column ?? 0}.`,
            )
          }
        }

        if (parent && index !== undefined) {
          parent.children.splice(index, 1, makHtmlImgNode(attributes, outputPath.imgPath, size))
        }
      }),
    )
  }
}

function makHtmlImgNode(attributes: DiagramAttributes, imgPath: string, size: D2Size): Html {
  const htmlAttributes: Record<string, string> = {
    alt: attributes.title,
    decoding: 'async',
    loading: 'lazy',
    src: imgPath,
  }

  computeImgSize(htmlAttributes, attributes, size)

  return {
    type: 'html',
    value: `<img ${Object.entries(htmlAttributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ')} />`,
  }
}

function getOutputPaths(config: AstroD2Config, file: VFile, nodeIndex: number) {
  const relativePath = path.relative(file.cwd, file.path).replace(/^src\/(content|pages)\//, '')
  const parsedRelativePath = path.parse(relativePath)

  const relativeOutputPath = path.join(parsedRelativePath.dir, `${parsedRelativePath.name}-${nodeIndex}.svg`)

  return {
    fsPath: path.join(file.cwd, 'public', config.output, relativeOutputPath),
    imgPath: path.posix.join('/', config.output, relativeOutputPath),
  }
}

function computeImgSize(htmlAttributes: Record<string, string>, attributes: DiagramAttributes, size: D2Size) {
  if (attributes.width !== undefined) {
    htmlAttributes['width'] = String(attributes.width)

    if (size) {
      const aspectRatio = size.height / size.width
      htmlAttributes['height'] = String(Math.round(attributes.width * aspectRatio))
    }
  } else if (size) {
    htmlAttributes['width'] = String(size.width)
    htmlAttributes['height'] = String(size.height)
  }
}

interface VisitorContext {
  index: number | undefined
  parent: Parent | undefined
}
