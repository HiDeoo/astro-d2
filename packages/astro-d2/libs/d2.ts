import type { AstroD2Config } from '../config'

import { exec } from './exec'

export async function isD2Installed() {
  try {
    await getD2Version()

    return true
  } catch {
    return false
  }
}

export async function generateD2Diagram(config: AstroD2Config, input: string, outputPath: string) {
  // TODO(HiDeoo) error handling

  const themeArgs = [`--theme=${config.theme.default}`]

  if (config.theme.dark !== false) {
    themeArgs.push(`--dark-theme=${config.theme.dark}`)
  }

  // The `-` argument is used to read from stdin instead of a file.
  await exec('d2', [...themeArgs, '-', outputPath], input)
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
