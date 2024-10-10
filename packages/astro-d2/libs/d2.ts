import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

import type { DiagramAttributes } from './attributes'
import { exec } from './exec'
import type { RemarkAstroD2Config } from './remark'

const viewBoxRegex = /viewBox="\d+ \d+ (?<width>\d+) (?<height>\d+)"/

export async function isD2Installed() {
  try {
    await getD2Version()

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

export async function getD2Diagram(diagramPath: string): Promise<D2Diagram | undefined> {
  try {
    const content = await fs.readFile(diagramPath, 'utf8')
    const match = content.match(viewBoxRegex)
    const { height, width } = match?.groups ?? {}

    if (!height || !width) {
      return
    }

    const computedHeight = Number.parseInt(height, 10)
    const computedWidth = Number.parseInt(width, 10)

    return { content, size: { height: computedHeight, width: computedWidth } }
  } catch (error) {
    throw new Error(`Failed to get D2 diagram size at '${diagramPath}'.`, { cause: error })
  }
}

async function getD2Version() {
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
