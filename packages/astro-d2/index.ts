import fs from 'node:fs/promises'
import path from 'node:path'

import type { AstroIntegration } from 'astro'

import { AstroD2ConfigSchema, type AstroD2UserConfig } from './config'
import { clearContentLayerCache } from './libs/astro'
import { isD2BinaryInstalled } from './libs/d2'
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
          if (!config.experimental.useD2js && !(await isD2BinaryInstalled())) {
            throwErrorWithHint(
              'Could not find D2. Please check the installation instructions at https://github.com/terrastruct/d2/blob/master/docs/INSTALL.md',
            )
          }

          if (command === 'build') {
            await clearContentLayerCache(astroConfig, logger)
            await fs.rm(path.join('public', config.output), { force: true, recursive: true })
          }
        }

        updateConfig({
          markdown: {
            remarkPlugins: [
              [
                remarkAstroD2,
                {
                  ...config,
                  base: astroConfig.base,
                  publicDir: astroConfig.publicDir,
                  root: astroConfig.root,
                },
              ],
            ],
          },
        })
      },
    },
  }
}
