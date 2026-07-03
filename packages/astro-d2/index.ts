import fs from 'node:fs/promises'
import path from 'node:path'

import type { AstroIntegration } from 'astro'
import { z } from 'astro/zod'

import { AstroD2ConfigSchema, type AstroD2UserConfig } from './config'
import { clearContentLayerCache } from './libs/astro'
import { isD2BinaryInstalled } from './libs/d2'
import { throwPluginError } from './libs/error'
import { applyMarkdownPlugin } from './libs/processor'

export type { AstroD2UserConfig } from './config'

export default function astroD2Integration(userConfig?: AstroD2UserConfig): AstroIntegration {
  const parsedConfig = AstroD2ConfigSchema.safeParse(userConfig)

  if (!parsedConfig.success) {
    throwPluginError(
      `Invalid astro-d2 configuration:

${z.prettifyError(parsedConfig.error)}
`,
    )
  }

  const config = parsedConfig.data

  return {
    name: 'astro-d2-integration',
    hooks: {
      'astro:config:setup': async ({ command, config: astroConfig, logger }) => {
        if (command !== 'build' && command !== 'dev') {
          return
        }

        if (config.skipGeneration) {
          logger.warn("Skipping generation of D2 diagrams as the 'skipGeneration' option is enabled.")
        } else {
          if (!config.experimental.useD2js && !(await isD2BinaryInstalled())) {
            throwPluginError(
              'Could not find D2. Please check the installation instructions at https://github.com/terrastruct/d2/blob/master/docs/INSTALL.md',
            )
          }

          if (command === 'build') {
            await clearContentLayerCache(astroConfig, logger)
            await fs.rm(path.join('public', config.output), { force: true, recursive: true })
          }
        }

        applyMarkdownPlugin(astroConfig.markdown.processor, {
          ...config,
          base: astroConfig.base,
          publicDir: astroConfig.publicDir,
          root: astroConfig.root,
        })
      },
    },
  }
}
