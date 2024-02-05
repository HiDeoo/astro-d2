const metaRegex = /(?<key>[^\s"'=]+)=(?:(?<noQuoteValue>\w+)|'(?<singleQuoteValue>[^']+)'|"(?<doubleQuoteValue>[^"]+))/g

export function parseMeta(metaStr: string | null | undefined): Meta {
  if (!metaStr) {
    return {}
  }

  const matches = metaStr.matchAll(metaRegex)

  const meta: Meta = {}

  for (const match of matches) {
    const { key, noQuoteValue, singleQuoteValue, doubleQuoteValue } = match.groups ?? {}

    const value = noQuoteValue ?? singleQuoteValue ?? doubleQuoteValue

    if (key && value) {
      meta[key] = value
    }
  }

  return meta
}

export type Meta = Record<string, string>
