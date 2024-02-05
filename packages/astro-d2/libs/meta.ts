import { z } from 'astro/zod'

const metaSchema = z
  .object({
    // TODO(HiDeoo)
    darkTheme: z.string().optional(),
    // TODO(HiDeoo)
    title: z.string().default('Diagram'),
    // TODO(HiDeoo)
    theme: z.string().optional(),
  })
  .default({})

const metaRegex = /(?<key>[^\s"'=]+)=(?:(?<noQuoteValue>\w+)|'(?<singleQuoteValue>[^']+)'|"(?<doubleQuoteValue>[^"]+))/g

export function getMeta(metaStr: string | null | undefined) {
  return metaSchema.parse(parseMeta(metaStr))
}

function parseMeta(metaStr: string | null | undefined) {
  if (!metaStr) {
    return {}
  }

  const matches = metaStr.matchAll(metaRegex)

  const meta: Record<string, string> = {}

  for (const match of matches) {
    const { key, noQuoteValue, singleQuoteValue, doubleQuoteValue } = match.groups ?? {}

    const value = noQuoteValue ?? singleQuoteValue ?? doubleQuoteValue

    if (key && value) {
      meta[key] = value
    }
  }

  return meta
}

export type DiagramMeta = z.infer<typeof metaSchema>
