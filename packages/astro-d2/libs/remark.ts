import path from 'node:path'
import url from 'node:url'

import type { Element } from 'hast'
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import type { Code, Html, Parent, Root } from 'mdast'
import { CONTINUE, EXIT, SKIP, visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

import type { AstroD2Config } from '../config'

import { type DiagramAttributes, getAttributes } from './attributes'
import { generateD2Diagram, type D2Size, getD2Diagram, type D2Diagram } from './d2'
import { throwErrorWithHint } from './integration'

export function remarkAstroD2(config: RemarkAstroD2Config) {
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
        let diagram: D2Diagram | undefined = undefined

        if (config.skipGeneration) {
          diagram = await getD2Diagram(outputPath.fsPath)
        } else {
          try {
            diagram = await generateD2Diagram(
              config,
              attributes,
              node.value,
              outputPath.fsPath,
              file.history[0] ? path.dirname(file.history[0]) : file.cwd,
            )
          } catch (error) {
            throwErrorWithHint(
              `Failed to generate the D2 diagram at ${node.position?.start.line ?? 0}:${node.position?.start.column ?? 0}.`,
              error instanceof Error ? (error.cause instanceof Error ? error.cause : error) : undefined,
            )
          }
        }

        if (parent && index !== undefined) {
          parent.children.splice(
            index,
            1,
            config.inline
              ? makeHtmlSvgNode(attributes, diagram)
              : makeHtmlImgNode(attributes, outputPath.imgPath, diagram?.size),
          )
        }
      }),
    )
  }
}

function makeHtmlImgNode(attributes: DiagramAttributes, imgPath: string, size: D2Size): Html {
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

function makeHtmlSvgNode(attributes: DiagramAttributes, diagram?: D2Diagram): Html {
  if (!diagram) {
    throwErrorWithHint('Failed to retrieve the D2 diagram content for inline rendering.')
  }

  const tree = fromHtml(diagram.content, { fragment: true })

  visit(tree, 'element', (node) => {
    if (node.tagName !== 'svg' || !('d2version' in node.properties)) return CONTINUE

    computeSvgSize(node, attributes, diagram.size)

    node.children.unshift({
      type: 'element',
      tagName: 'title',
      properties: {},
      children: [{ type: 'text', value: attributes.title }],
    })

    return EXIT
  })

  return {
    type: 'html',
    value: toHtml(tree),
  }
}

function getOutputPaths(config: RemarkAstroD2Config, file: VFile, nodeIndex: number) {
  const relativePath = path.relative(file.cwd, file.path).replace(/^src[/\\](content|pages)[/\\]/, '')
  const parsedRelativePath = path.parse(relativePath)

  const relativeOutputPath = path.join(parsedRelativePath.dir, `${parsedRelativePath.name}-${nodeIndex}.svg`)

  return {
    fsPath: path.join(url.fileURLToPath(config.publicDir), config.output, relativeOutputPath),
    imgPath: path.posix.join(config.base, config.output, relativeOutputPath),
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

function computeSvgSize(node: Element, attributes: DiagramAttributes, size: D2Size) {
  if (!attributes.width || !size) return

  const aspectRatio = size.height / size.width

  node.properties['width'] = String(attributes.width)
  node.properties['height'] = String(Math.round(attributes.width * aspectRatio))
}

interface VisitorContext {
  index: number | undefined
  parent: Parent | undefined
}

export interface RemarkAstroD2Config extends AstroD2Config {
  base: string
  publicDir: URL
  root: URL
}
