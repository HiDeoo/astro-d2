import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

import { D2, type CompileRequest } from '@terrastruct/d2'

import type { DiagramAttributes } from './attributes'
import { exec } from './exec'
import type { RemarkAstroD2Config } from './remark'

const viewBoxRegex = /viewBox="\d+ \d+ (?<width>\d+) (?<height>\d+)"/

// When using D2.js, we cache the loaded fonts to avoid reading them for each diagram.
const jsFonts: Partial<Record<D2Font, Uint8Array>> = {}

export async function isD2BinaryInstalled() {
  try {
    await getD2BinaryVersion()

    return true
  } catch {
    return false
  }
}

export async function generateD2Diagram(
  config: RemarkAstroD2Config,
  attributes: DiagramAttributes,
  input: string,
  outputPath: string,
  cwd: string,
) {
  const generateFn = config.experimental.useD2js ? generateD2jsDiagram : generateD2BinaryDiagram
  return generateFn(config, attributes, input, outputPath, cwd)
}

async function generateD2BinaryDiagram(
  config: RemarkAstroD2Config,
  attributes: DiagramAttributes,
  input: string,
  outputPath: string,
  cwd: string,
) {
  const extraArgs = []

  if (
    (config.theme.dark !== false && attributes.darkTheme !== false) ||
    (attributes.darkTheme !== undefined && attributes.darkTheme !== false)
  ) {
    extraArgs.push(`--dark-theme=${attributes.darkTheme ?? config.theme.dark}`)
  }

  if (attributes.animateInterval) {
    extraArgs.push(`--animate-interval=${attributes.animateInterval}`)
  }

  if (attributes.target !== undefined) {
    extraArgs.push(`--target=${attributes.target}`)
  }

  if (config.fonts?.regular) {
    extraArgs.push(
      `--font-regular=${path.relative(cwd, path.join(url.fileURLToPath(config.root), config.fonts.regular))}`,
    )
  }

  if (config.fonts?.italic) {
    extraArgs.push(
      `--font-italic=${path.relative(cwd, path.join(url.fileURLToPath(config.root), config.fonts.italic))}`,
    )
  }

  if (config.fonts?.bold) {
    extraArgs.push(`--font-bold=${path.relative(cwd, path.join(url.fileURLToPath(config.root), config.fonts.bold))}`)
  }

  if (config.fonts?.semibold) {
    extraArgs.push(
      `--font-semibold=${path.relative(cwd, path.join(url.fileURLToPath(config.root), config.fonts.semibold))}`,
    )
  }

  if ((config.appendix && attributes.appendix !== false) || attributes.appendix === true) {
    extraArgs.push(`--force-appendix`)
  }

  try {
    // The `-` argument is used to read from stdin instead of a file.
    await exec(
      'd2',
      [
        `--layout=${attributes.layout ?? config.layout}`,
        `--theme=${attributes.theme ?? config.theme.default}`,
        `--sketch=${attributes.sketch ?? config.sketch}`,
        `--pad=${attributes.pad ?? config.pad}`,
        ...extraArgs,
        '-',
        outputPath,
      ],
      input,
      cwd,
    )
  } catch (error) {
    throw new Error('Failed to generate D2 diagram.', { cause: error })
  }

  return await getD2Diagram(outputPath)
}

async function generateD2jsDiagram(
  config: RemarkAstroD2Config,
  attributes: DiagramAttributes,
  input: string,
  outputPath: string,
) {
  try {
    const request: CompileRequest = {
      fs: { [outputPath]: input },
      inputPath: outputPath,
      options: {
        // @ts-expect-error - We enforce that the layout cannot be 'tala' when using D2.js when validating the config.
        layout: attributes.layout ?? config.layout,
        pad: attributes.pad ?? config.pad,
        sketch: (attributes.sketch === 'true' ? true : attributes.sketch) ?? config.sketch,
        themeID: Number.parseInt(attributes.theme ?? config.theme.default, 10),
      },
    }

    const darkTheme = attributes.darkTheme ?? config.theme.dark
    if (darkTheme !== false) request.options.darkThemeID = Number.parseInt(darkTheme, 10)

    if (attributes.animateInterval) request.options.animateInterval = Number.parseInt(attributes.animateInterval, 10)

    if (attributes.target !== undefined) request.options.target = attributes.target
    else if (attributes.animateInterval) request.options.target = '*'

    if (config.fonts?.regular) {
      request.options.fontRegular = await getD2jsFont('regular', config.root, config.fonts.regular)
    }

    if (config.fonts?.italic) {
      request.options.fontItalic = await getD2jsFont('italic', config.root, config.fonts.italic)
    }

    if (config.fonts?.bold) {
      request.options.fontBold = await getD2jsFont('bold', config.root, config.fonts.bold)
    }

    if (config.fonts?.semibold) {
      request.options.fontSemibold = await getD2jsFont('semibold', config.root, config.fonts.semibold)
    }

    if ((config.appendix && attributes.appendix !== false) || attributes.appendix === true) {
      request.options.forceAppendix = true
    }

    const d2 = new D2()
    const response = await d2.compile(request)
    const content = await d2.render(response.diagram, response.renderOptions)

    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, content)

    return getD2DiagramFromContent(content)
  } catch (error) {
    throw new Error('Failed to generate D2 diagram using D2.js.', { cause: error })
  }
}

export async function getD2Diagram(diagramPath: string): Promise<D2Diagram | undefined> {
  try {
    const content = await fs.readFile(diagramPath, 'utf8')
    return getD2DiagramFromContent(content)
  } catch (error) {
    throw new Error(`Failed to get D2 diagram size at '${diagramPath}'.`, { cause: error })
  }
}

function getD2DiagramFromContent(content: string): D2Diagram | undefined {
  const match = viewBoxRegex.exec(content)
  const { height, width } = match?.groups ?? {}

  if (!height || !width) {
    return
  }

  const computedHeight = Number.parseInt(height, 10)
  const computedWidth = Number.parseInt(width, 10)

  return { content, size: { height: computedHeight, width: computedWidth } }
}

async function getD2BinaryVersion() {
  try {
    const [version] = await exec('d2', ['--version'])

    if (!version || !/^v?\d+\.\d+\.\d+/.test(version)) {
      throw new Error(`Invalid D2 version, got '${version}'.`)
    }

    return version
  } catch (error) {
    throw new Error('Failed to get D2 version.', { cause: error })
  }
}

async function getD2jsFont(font: D2Font, root: URL, fontPath: string): Promise<Uint8Array> {
  if (jsFonts[font]) return jsFonts[font]

  const buffer = await fs.readFile(path.join(url.fileURLToPath(root), fontPath))

  // Necessary when crossing the JS/WASM boundary.
  jsFonts[font] = [...buffer] as unknown as Uint8Array

  return jsFonts[font]
}

export interface D2Diagram {
  content: string
  size: D2Size
}

export type D2Size =
  | {
      height: number
      width: number
    }
  | undefined

type D2Font = 'regular' | 'italic' | 'bold' | 'semibold'
