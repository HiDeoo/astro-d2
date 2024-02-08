import { spawn } from 'node:child_process'

export function exec(command: string, args: string[], stdin?: string) {
  return new Promise<string[]>((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: [],
    })

    const output: string[] = []
    const errorMessage = `Unable to run command: '${command} ${args.join(' ')}'.`

    child.stdout.on('data', (data: Buffer) => {
      const lines = data
        .toString()
        .split('\n')
        .filter((line) => line.length > 0)

      output.push(...lines)
    })

    child.on('error', (error) => {
      reject(new Error(errorMessage, { cause: error }))
    })

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(errorMessage))

        return
      }

      resolve(output)
    })

    if (stdin) {
      child.stdin.write(stdin)
      child.stdin.end()
    }
  })
}
