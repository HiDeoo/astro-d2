import { AstroError } from 'astro/errors'

export function throwErrorWithHint(message: string): never {
  throw new AstroError(
    message,
    `See the error report above for more informations.\n\nIf you believe this is a bug, please file an issue at https://github.com/HiDeoo/astro-d2/issues/new/choose`,
  )
}
