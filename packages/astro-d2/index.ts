import fs from 'node:fs/promises'
import path from 'node:path'

import type { AstroIntegration } from 'astro'

import { AstroD2ConfigSchema, type AstroD2UserConfig } from './config'
import { isD2Installed } from './libs/d2'
import { throwErrorWithHint } from './libs/integration'
import { remarkAstroD2 } from './libs/remark'

export type { AstroD2UserConfig } from './config'

export default function astroD2Integration(userConfig?: AstroD2UserConfig): AstroIntegration {
  const parsedConfig = AstroD2ConfigSchema.safeParse(userConfig)

  if (!parsedConfig.success) {
    throwErrorWithHint(
      `The provided D2 integration configuration is invalid.\n${parsedConfig.error.issues.map((issue) => issue.message).join('\n')}`,
    )
  }

  const config = parsedConfig.data

  return {
    name: 'astro-d2-integration',
    hooks: {
      'astro:config:setup': async ({ command, config: astroConfig, logger, updateConfig }) => {
        if (command !== 'build' && command !== 'dev') {
          return
        }

        if (config.skipGeneration) {
          logger.warn("Skipping generation of D2 diagrams as the 'skipGeneration' option is enabled.")
        } else {
          if (!(await isD2Installed())) {
            throwErrorWithHint(
              'Could not find D2. Please check the installation instructions at https://github.com/terrastruct/d2/blob/master/docs/INSTALL.md',
            )
          }

          if (command === 'build') {
            await fs.rm(path.join('public', config.output), { force: true, recursive: true })
          }
        }

        updateConfig({
          markdown: {
            remarkPlugins: [[remarkAstroD2, { ...config, base: astroConfig.base, root: astroConfig.root }]],
          },
        })
      },
    },
  }
}
