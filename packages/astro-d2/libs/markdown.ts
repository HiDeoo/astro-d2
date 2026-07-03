import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Element } from 'hast'
import { fromHtml } from 'hast-util-from-html'
import { toHtml } from 'hast-util-to-html'
import type { Code, Html } from 'mdast'
import { CONTINUE, EXIT, visit } from 'unist-util-visit'

import type { AstroD2Config } from '../config'

import { getAttributes, type DiagramAttributes } from './attributes'
import { generateD2Diagram, getD2Diagram, type D2Diagram, type D2Size } from './d2'
import { throwPluginError } from './error'

export async function renderD2Node(
  config: MarkdownAstroD2Config,
  node: Code,
  file: MarkdownFile,
  nodeIndex: number,
): Promise<Html> {
  const outputPath = getOutputPaths(config, file, nodeIndex)
  const attributes = getAttributes(node.meta)
  let diagram: D2Diagram | undefined = undefined

  if (config.skipGeneration) {
    diagram = await getD2Diagram(outputPath.fsPath)
  } else {
    try {
      const baseCwd = path.dirname(file.path)
      const { cwd, input } = await getDiagramSource(attributes, node.value, baseCwd)
      diagram = await generateD2Diagram(config, attributes, input, outputPath.fsPath, cwd)
    } catch (error) {
      throwPluginError(
        `Failed to generate the D2 diagram at ${node.position?.start.line ?? 0}:${node.position?.start.column ?? 0}.`,
        error instanceof Error ? (error.cause instanceof Error ? error.cause : error) : undefined,
      )
    }
  }

  return (attributes.inline ?? config.inline)
    ? makeHtmlSvgNode(attributes, diagram)
    : makeHtmlImgNode(attributes, outputPath.imgPath, diagram?.size)
}

function getOutputPaths(config: MarkdownAstroD2Config, file: MarkdownFile, nodeIndex: number) {
  const relativePath = path.relative(file.cwd, file.path).replace(/^src[/\\](content|pages)[/\\]/, '')
  const parsedRelativePath = path.parse(relativePath)

  const relativeOutputPath = path.join(parsedRelativePath.dir, `${parsedRelativePath.name}-${nodeIndex}.svg`)

  return {
    fsPath: path.join(fileURLToPath(config.publicDir), config.output, relativeOutputPath),
    imgPath: path.posix.join(config.base, config.output, relativeOutputPath),
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
    throwPluginError('Failed to retrieve the D2 diagram content for inline rendering.')
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

/**
 * Returns the D2 diagram source and the working directory to generate it from.
 *
 * When the `src` attribute is set, the referenced file is read relative to the Markdown file directory and its own
 * directory becomes the working directory so that relative D2 imports keep resolving. Otherwise, the code fence content
 * is used as-is.
 */
async function getDiagramSource(
  attributes: DiagramAttributes,
  input: string,
  cwd: string,
): Promise<{ cwd: string; input: string }> {
  if (!attributes.src) {
    return { cwd, input }
  }

  const srcPath = path.resolve(cwd, attributes.src)

  try {
    return { cwd: path.dirname(srcPath), input: await fs.readFile(srcPath, 'utf8') }
  } catch (error) {
    throw new Error(`Failed to read the D2 diagram source file '${attributes.src}'.`, { cause: error })
  }
}

interface MarkdownFile {
  cwd: string
  path: string
}

export interface MarkdownAstroD2Config extends AstroD2Config {
  base: string
  publicDir: URL
  root: URL
}
