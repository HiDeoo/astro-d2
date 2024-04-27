import { z } from 'astro/zod'

export const AttributesSchema = z
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
     * Overrides the global `pad` configuration for the diagram.
     */
    pad: z.coerce.number().optional(),
    /**
     * Overrides the global `sketch` configuration for the diagram.
     */
    sketch: z
      .union([z.literal('true'), z.literal('false')])
      .optional()
      .transform((value) => (value === 'false' ? false : value)),
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

const attributeRegex =
  /(?<key>[^\s"'=]+)=(?:(?<noQuoteValue>\w+)|'(?<singleQuoteValue>[^']+)'|"(?<doubleQuoteValue>[^"]+))|(?<truthyKey>\w+)/g

export function getAttributes(attributesStr: string | null | undefined) {
  return AttributesSchema.parse(parseAttributes(attributesStr))
}

function parseAttributes(attributesStr: string | null | undefined) {
  if (!attributesStr) {
    return {}
  }

  const matches = attributesStr.matchAll(attributeRegex)

  const attributes: Record<string, string> = {}

  for (const match of matches) {
    const { key, noQuoteValue, singleQuoteValue, doubleQuoteValue, truthyKey } = match.groups ?? {}

    const attributeKey = truthyKey ?? key
    const attributeValue = truthyKey ? 'true' : noQuoteValue ?? singleQuoteValue ?? doubleQuoteValue

    if (attributeKey && attributeValue) {
      attributes[attributeKey] = attributeValue
    }
  }

  return attributes
}

export type DiagramAttributes = z.infer<typeof AttributesSchema>
