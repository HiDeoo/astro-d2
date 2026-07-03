import type { AstroD2Config } from '../config'

export interface MarkdownAstroD2Config extends AstroD2Config {
  base: string
  publicDir: URL
  root: URL
}
