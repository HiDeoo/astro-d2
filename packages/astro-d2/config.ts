import { z } from 'astro/zod'

export const AstroD2ConfigSchema = z
  .object({
    // TODO(HiDeoo)
    enabled: z.boolean().default(true),
    // TODO(HiDeoo)
    output: z.string().default('d2'),
  })
  .default({})

export type AstroD2UserConfig = z.input<typeof AstroD2ConfigSchema>
export type AstroD2Config = z.output<typeof AstroD2ConfigSchema>
