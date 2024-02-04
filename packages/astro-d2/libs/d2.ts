import { exec } from './exec'

export async function isD2Installed() {
  try {
    await getD2Version()

    return true
  } catch {
    return false
  }
}

export async function generateD2Diagram(input: string, outputPath: string) {
  // TODO(HiDeoo) error handling

  // The `-` argument is used to read from stdin instead of a file.
  await exec('d2', ['-', outputPath], input)
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
