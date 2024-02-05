import { z } from 'astro/zod'

export const AstroD2ConfigSchema = z
  .object({
    // TODO(HiDeoo)
    enabled: z.boolean().default(true),
    // TODO(HiDeoo)
    layout: z.union([z.literal('dagre'), z.literal('elk'), z.literal('tala')]).default('dagre'),
    // TODO(HiDeoo)
    output: z.string().default('d2'),
    // TODO(HiDeoo)
    theme: z
      .object({
        // TODO(HiDeoo)
        dark: z.union([z.string(), z.literal(false)]).default('200'),
        // TODO(HiDeoo)
        default: z.string().default('0'),
      })
      .default({}),
  })
  .default({})

export type AstroD2UserConfig = z.input<typeof AstroD2ConfigSchema>
export type AstroD2Config = z.output<typeof AstroD2ConfigSchema>
