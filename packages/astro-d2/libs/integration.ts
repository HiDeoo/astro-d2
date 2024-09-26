import { AstroError } from 'astro/errors'

export function throwErrorWithHint(message: string, cause?: Error): never {
  throw new AstroError(
    message + (cause ? `\n\n${cause.message}` : ''),
    `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/HiDeoo/astro-d2/issues/new/choose`,
  )
}
