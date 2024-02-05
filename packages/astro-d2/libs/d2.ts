import fs from 'node:fs/promises'

import type { AstroD2Config } from '../config'

import { exec } from './exec'
import type { DiagramMeta } from './meta'

const viewBoxRegex = /viewBox="\d+ \d+ (?<width>\d+) (?<height>\d+)"/

export async function isD2Installed() {
  try {
    await getD2Version()

    return true
  } catch {
    return false
  }
}

export async function generateD2Diagram(config: AstroD2Config, meta: DiagramMeta, input: string, outputPath: string) {
  const themeArgs = [`--theme=${meta.theme ?? config.theme.default}`]

  if (
    (config.theme.dark !== false && meta.darkTheme !== false) ||
    (meta.darkTheme !== undefined && meta.darkTheme !== false)
  ) {
    themeArgs.push(`--dark-theme=${meta.darkTheme ?? config.theme.dark}`)
  }

  try {
    // The `-` argument is used to read from stdin instead of a file.
    await exec('d2', [...themeArgs, `--sketch=${meta.sketch}`, '-', outputPath], input)
  } catch (error) {
    throw new Error('Failed to generate D2 diagram.', { cause: error })
  }

  return await getD2DiagramSize(outputPath)
}

async function getD2Version() {
  try {
    const [version] = await exec('d2', ['--version'])

    if (!version || !/^\d+\.\d+\.\d+$/.test(version)) {
      throw new Error(`Invalid D2 version, got '${version}'.`)
    }

    return version
  } catch (error) {
    throw new Error('Failed to get D2 version.', { cause: error })
  }
}

async function getD2DiagramSize(diagramPath: string): Promise<D2Size> {
  try {
    const content = await fs.readFile(diagramPath, 'utf8')
    const match = content.match(viewBoxRegex)
    const { height, width } = match?.groups ?? {}

    return { height, width }
  } catch (error) {
    throw new Error('Failed to get D2 diagram size.', { cause: error })
  }
}

export interface D2Size {
  height: string | undefined
  width: string | undefined
}
