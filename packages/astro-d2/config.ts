import { z } from 'astro/zod'

export const AstroD2ConfigSchema = z
  .object({
    /**
     * Whether to add an appendix to the diagrams with tooltips or links.
     *
     * @default false
     * @see https://d2lang.com/tour/interactive/
     */
    appendix: z.boolean().default(false),
    /**
     * Available experimental flags.
     *
     * Note that experimental flags are not guaranteed to be stable and may change or be removed in any future release.
     */
    experimental: z
      .object({
        /**
         * Whether to use D2.js to generate the diagrams instead of the D2 binary.
         *
         * By default, the integration requires the D2 binary to be installed on the system to generate diagrams.
         * Enabling this option allows generating diagrams using D2.js, a JavaScript wrapper around D2 to run it through
         * WebAssembly.
         *
         * @default false
         */
        useD2js: z.boolean().default(false),
      })
      .default({}),
    /**
     * Defines the fonts to use for the generated diagrams.
     *
     * @see https://d2lang.com/tour/fonts/
     */
    fonts: z
      .object({
        /**
         * The relative path from the project's root to the .ttf font file to use for the regular font.
         */
        regular: z.string().optional(),
        /**
         * The relative path from the project's root to the .ttf font file to use for the italic font.
         */
        italic: z.string().optional(),
        /**
         * The relative path from the project's root to the .ttf font file to use for the bold font.
         */
        bold: z.string().optional(),
        /**
         * The relative path from the project's root to the .ttf font file to use for the semibold font.
         */
        semibold: z.string().optional(),
      })
      .optional(),
    /**
     * Defines if the SVG diagrams should be inlined in the HTML output.
     *
     * By default, the diagrams are rendered using the `<img>` tag.
     */
    inline: z.boolean().default(false),
    /**
     * Defines the layout engine to use to generate the diagrams.
     *
     * @default 'dagre'
     * @see https://d2lang.com/tour/layouts#layout-engines
     */
    layout: z.union([z.literal('dagre'), z.literal('elk'), z.literal('tala')]).default('dagre'),
    /**
     * The name of the output directory containing the generated diagrams relative to the `public/` directory.
     *
     * @default 'd2'
     */
    output: z.string().default('d2'),
    /**
     * The padding (in pixels) around the rendered diagrams.
     *
     * @default 100
     */
    pad: z.number().default(100),
    /**
     * Whether to render the diagrams as if they were sketched by hand.
     *
     * @default false
     */
    sketch: z.boolean().default(false),
    /**
     * Whether the Astro D2 integration should skip the generation of diagrams.
     *
     * This is useful to disable generating diagrams when deploying on platforms that do not have the D2 binary
     * available. This will require you to build and commit the diagrams before deploying your site.
     *
     * @default false
     */
    skipGeneration: z.boolean().default(false),
    /**
     * The themes to use for the generated diagrams.
     *
     * @see https://d2lang.com/tour/themes
     */
    theme: z
      .object({
        /**
         * The dark theme to use for the diagrams when the user's system preference is set to dark mode.
         *
         * To disable the dark theme and have all diagrams look the same, set this option to `false`.
         *
         * @default '200'
         * @see https://d2lang.com/tour/themes
         */
        dark: z.union([z.string(), z.literal(false)]).default('200'),
        /**
         * The default theme to use for the diagrams.
         *
         * @default '0'
         * @see https://d2lang.com/tour/themes
         */
        default: z.string().default('0'),
      })
      .default({}),
  })
  .refine((config) => config.layout !== 'tala' || !config.experimental.useD2js, {
    // TODO(HiDeoo) test
    message: 'The `tala` layout engine is not supported when using the `experimental.useD2js` option.',
  })
  .default({})

export type AstroD2UserConfig = z.input<typeof AstroD2ConfigSchema>
export type AstroD2Config = z.output<typeof AstroD2ConfigSchema>
