import fs from 'node:fs/promises'

import type { AstroD2Config } from '../config'

import type { DiagramAttributes } from './attributes'
import { exec } from './exec'

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
  config: AstroD2Config,
  attributes: DiagramAttributes,
  input: string,
  outputPath: string,
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
    extraArgs.push(`--target='${attributes.target}'`)
  }

  if (attributes.sketch !== undefined) {
    extraArgs.push(`--sketch=${attributes.sketch}`)
  }

  if (attributes.pad !== undefined) {
    extraArgs.push(`--pad=${attributes.pad}`)
  }

  try {
    // The `-` argument is used to read from stdin instead of a file.
    await exec(
      'd2',
      [
        `--layout=${config.layout}`,
        `--theme=${attributes.theme ?? config.theme.default}`,
        `--sketch=${attributes.sketch ?? config.sketch}`,
        `--pad=${attributes.pad ?? config.pad}`,
        ...extraArgs,
        '-',
        outputPath,
      ],
      input,
    )
  } catch (error) {
    throw new Error('Failed to generate D2 diagram.', { cause: error })
  }

  return await getD2DiagramSize(outputPath)
}

export async function getD2DiagramSize(diagramPath: string): Promise<D2Size> {
  try {
    const content = await fs.readFile(diagramPath, 'utf8')
    const match = content.match(viewBoxRegex)
    const { height, width } = match?.groups ?? {}

    if (!height || !width) {
      return
    }

    const computedHeight = Number.parseInt(height, 10)
    const computedWidth = Number.parseInt(width, 10)

    return { height: computedHeight, width: computedWidth }
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

export type D2Size =
  | {
      height: number
      width: number
    }
  | undefined
