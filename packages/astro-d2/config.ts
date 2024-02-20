import { z } from 'astro/zod'

export const AstroD2ConfigSchema = z
  .object({
    /**
     * The base path to use website.
     *
     * This is useful when you want to serve the astro website from a subdirectory.
     *
     * @default ''
     */
    basePath: z.string().default(''),
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
  .default({})

export type AstroD2UserConfig = z.input<typeof AstroD2ConfigSchema>
export type AstroD2Config = z.output<typeof AstroD2ConfigSchema>
