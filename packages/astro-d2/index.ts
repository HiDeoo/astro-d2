import fs from 'node:fs/promises'
import path from 'node:path'

import type { AstroIntegration } from 'astro'
import { z } from 'astro/zod'

import { isD2Installed } from './libs/d2'
import { throwErrorWithHint } from './libs/integration'
import { remarkAstroD2 } from './libs/remark'

const astroD2ConfigSchema = z
  .object({
    // TODO(HiDeoo)
    enabled: z.boolean().default(true),
    // TODO(HiDeoo)
    output: z.string().default('d2'),
  })
  .default({})

export default function astroD2Integration(userConfig?: AstroD2UserConfig): AstroIntegration {
  const parsedConfig = astroD2ConfigSchema.safeParse(userConfig)

  if (!parsedConfig.success) {
    throwErrorWithHint(
      `The provided D2 integration configuration is invalid.\n${parsedConfig.error.issues.map((issue) => issue.message).join('\n')}`,
    )
  }

  const config = parsedConfig.data

  return {
    name: 'astro-d2-integration',
    hooks: {
      'astro:config:setup': async ({ logger, updateConfig }) => {
        if (!config.enabled) {
          logger.warn('The D2 integration is disabled, skipping diagrams generation.')
          return
        }

        if (!(await isD2Installed())) {
          throwErrorWithHint(
            'Could not find D2. Please check the installation instructions at https://github.com/terrastruct/d2/blob/master/docs/INSTALL.md',
          )
        }

        await fs.rm(path.join('public', config.output), { force: true, recursive: true })

        updateConfig({
          markdown: {
            remarkPlugins: [[remarkAstroD2, config]],
          },
        })
      },
    },
  }
}

export type AstroD2UserConfig = z.input<typeof astroD2ConfigSchema>
export type AstroD2Config = z.output<typeof astroD2ConfigSchema>
