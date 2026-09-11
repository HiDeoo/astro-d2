import fs from 'node:fs/promises'
import path from 'node:path'

import type { AstroIntegration } from 'astro'
import { z } from 'astro/zod'

import { AstroD2ConfigSchema, type AstroD2UserConfig } from './config'
import { clearContentLayerCache } from './libs/astro'
import { disposeD2js, isD2BinaryInstalled } from './libs/d2'
import { throwPluginError } from './libs/error'
import type { MarkdownAstroD2Config } from './libs/markdown'
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
  let markdownConfig: MarkdownAstroD2Config | undefined

  return {
    name: 'astro-d2',
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

        markdownConfig = {
          ...config,
          base: astroConfig.base,
          publicDir: astroConfig.publicDir,
          root: astroConfig.root,
        }

        applyMarkdownPlugin(astroConfig.markdown.processor, markdownConfig)
      },
      'astro:build:done': () => disposeD2js(markdownConfig),
      'astro:server:done': () => disposeD2js(markdownConfig),
    },
  }
}
