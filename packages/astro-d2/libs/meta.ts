import { z } from 'astro/zod'

export const MetaSchema = z
  .object({
    /**
     * When specified, the diagram will package multiple boards as 1 SVG which transitions through each board at the
     * specified interval (in milliseconds).
     */
    animateInterval: z.string().optional(),
    /**
     * The dark theme to use for the diagrams when the user's system preference is set to dark mode.
     *
     * To disable the dark theme and have all diagrams look the same, set this attribute to `'false'`.
     *
     * @see https://d2lang.com/tour/themes
     */
    darkTheme: z
      .string()
      .optional()
      .transform((value) => (value === 'false' ? false : value)),
    /**
     * The padding (in pixels) around the rendered diagram.
     *
     * @default 100
     */
    pad: z.coerce.number().default(100),
    /**
     * Whether to render the diagram as if it was sketched by hand.
     *
     * @default 'false'
     */
    sketch: z.union([z.literal('true'), z.literal('false')]).default('false'),
    /**
     * Defines the target board to render when using composition.
     * Use `root` to target the root board.
     *
     * @see https://d2lang.com/tour/composition
     */
    target: z
      .string()
      .optional()
      .transform((value) => (value === 'root' ? '' : value)),
    /**
     * The title of the diagram that will be used as the `alt` attribute of the generated image.
     *
     * @default 'Diagram'
     */
    title: z.string().default('Diagram'),
    /**
     * The default theme to use for the diagrams.
     *
     * @see https://d2lang.com/tour/themes
     */
    theme: z.string().optional(),
    /**
     * The width (in pixels) of the diagram.
     */
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
