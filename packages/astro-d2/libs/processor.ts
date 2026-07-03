import type { AstroConfig } from 'astro'

import { throwPluginError } from './error'
import type { MarkdownAstroD2Config } from './markdown'
import { remarkAstroD2 } from './remark'

export function applyMarkdownPlugin(processor: MarkdownProcessor, config: MarkdownAstroD2Config) {
  if (isSatteriProcessor(processor)) {
    // TODO(HiDeoo)
    // processor.options.mdastPlugins.push(satteriMdastStarlightHeadingBadges())
  } else if (isUnifiedProcessor(processor)) {
    processor.options.remarkPlugins.push([remarkAstroD2, config])
  } else {
    throwPluginError("The configured 'markdown.processor' is not supported by the astro-d2 integration.")
  }
}

function isSatteriProcessor(processor: unknown): processor is SatteriMarkdownProcessor {
  if (typeof processor !== 'object' || processor === null) return false
  const candidate = processor as { name?: unknown; options?: { mdastPlugins?: unknown[] } }
  return candidate.name === 'satteri' && Array.isArray(candidate.options?.mdastPlugins)
}

function isUnifiedProcessor(processor: unknown): processor is UnifiedMarkdownProcessor {
  if (typeof processor !== 'object' || processor === null) return false
  const candidate = processor as { name?: unknown; options?: { remarkPlugins?: unknown[] } }
  return candidate.name === 'unified' && Array.isArray(candidate.options?.remarkPlugins)
}

type MarkdownProcessor = NonNullable<AstroConfig['markdown']['processor']>

interface SatteriMarkdownProcessor {
  name: string
  options: { mdastPlugins: unknown[] }
}

interface UnifiedMarkdownProcessor {
  name: string
  options: { remarkPlugins: unknown[] }
}
