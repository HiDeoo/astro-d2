import { z } from 'astro/zod'

export const MetaSchema = z
  .object({
    // TODO(HiDeoo)
    animateInterval: z.string().optional(),
    // TODO(HiDeoo)
    darkTheme: z
      .string()
      .optional()
      .transform((value) => (value === 'false' ? false : value)),
    // TODO(HiDeoo)
    height: z.coerce.number().optional(),
    // TODO(HiDeoo)
    pad: z.coerce.number().default(100),
    // TODO(HiDeoo)
    sketch: z.union([z.literal('true'), z.literal('false')]).default('false'),
    // TODO(HiDeoo)
    target: z
      .string()
      .optional()
      .transform((value) => (value === 'root' ? '' : value)),
    // TODO(HiDeoo)
    title: z.string().default('Diagram'),
    // TODO(HiDeoo)
    theme: z.string().optional(),
    // TODO(HiDeoo)
    width: z.coerce.number().optional(),
  })
  .default({})

const metaRegex =
  /(?<key>[^\s"'=]+)=(?:(?<noQuoteValue>\w+)|'(?<singleQuoteValue>[^']+)'|"(?<doubleQuoteValue>[^"]+))|(?<truthyKey>\w+)/g

export function getMeta(metaStr: string | null | undefined) {
  return MetaSchema.parse(parseMeta(metaStr))
}

function parseMeta(metaStr: string | null | undefined) {
  if (!metaStr) {
    return {}
  }

  const matches = metaStr.matchAll(metaRegex)

  const meta: Record<string, string> = {}

  for (const match of matches) {
    const { key, noQuoteValue, singleQuoteValue, doubleQuoteValue, truthyKey } = match.groups ?? {}

    const metaKey = truthyKey ?? key
    const metaValue = truthyKey ? 'true' : noQuoteValue ?? singleQuoteValue ?? doubleQuoteValue

    if (metaKey && metaValue) {
      meta[metaKey] = metaValue
    }
  }

  return meta
}

export type DiagramMeta = z.infer<typeof MetaSchema>
