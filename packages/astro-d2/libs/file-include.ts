import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { Code, Root } from 'mdast'
import { visit } from 'unist-util-visit'
import type { VFile } from 'vfile'

/** Matches `file=./path.d2`, `file="path"`, or `file='path'`. */
export const FILE_META_RE = /\bfile=(?:'([^']+)'|"([^"]+)"|(\S+))/

export interface FileIncludeOptions {
  /**
   * Optional paths relative to the project root (`file.cwd`) that D2 includes may resolve under.
   * By default, includes must stay within the project root.
   */
  allowedIncludeRoots?: string[]
}

/**
 * @param meta Code fence meta string (attributes after ```d2).
 */
export function parseFileAttribute(meta: string | null | undefined): string | null {
  if (!meta) return null
  const match = meta.match(FILE_META_RE)
  if (!match) return null
  return match[1] ?? match[2] ?? match[3] ?? null
}

export function stripFileAttribute(meta: string | null | undefined): string | null {
  if (!meta) return null
  const stripped = meta.replace(FILE_META_RE, '').trim()
  return stripped || null
}

function toFilesystemPath(filePath: string, cwd: string): string {
  const raw = String(filePath)
  if (raw.startsWith('file://')) {
    return fileURLToPath(raw)
  }
  return path.isAbsolute(raw) ? raw : path.resolve(cwd, raw)
}

function getAllowedRoots(cwd: string, allowedIncludeRoots?: string[]): string[] {
  const roots = [path.resolve(cwd)]
  if (allowedIncludeRoots) {
    for (const root of allowedIncludeRoots) {
      roots.push(path.resolve(cwd, root))
    }
  }
  return roots
}

export function isPathInsideRoot(resolved: string, root: string): boolean {
  const normalizedResolved = path.resolve(resolved)
  const normalizedRoot = path.resolve(root)
  if (normalizedResolved === normalizedRoot) {
    return true
  }
  return normalizedResolved.startsWith(`${normalizedRoot}${path.sep}`)
}

/**
 * Resolve the filesystem path of the Markdown file being processed.
 */
export function resolveMarkdownPath(file: VFile): string | null {
  const candidates = [file.path, ...(file.history ?? [])].filter(Boolean) as string[]

  for (const candidate of candidates) {
    try {
      return toFilesystemPath(candidate, file.cwd)
    } catch {
      continue
    }
  }

  const entryId = file.data?.astro?.id
  if (typeof entryId === 'string') {
    const rel = entryId.endsWith('.md') || entryId.endsWith('.mdx') ? entryId : `${entryId}.md`
    return path.resolve(file.cwd, rel)
  }

  return null
}

/**
 * Resolve a `file=` path relative to the Markdown file directory and ensure it stays within allowed roots.
 */
export function resolveD2FilePath(
  markdownPath: string,
  relativeFile: string,
  options: FileIncludeOptions & { cwd: string },
): string {
  const mdPath = toFilesystemPath(markdownPath, options.cwd)
  const mdDir = path.dirname(mdPath)
  const resolved = path.normalize(path.resolve(mdDir, relativeFile))
  const allowedRoots = getAllowedRoots(options.cwd, options.allowedIncludeRoots)

  if (!allowedRoots.some((root) => isPathInsideRoot(resolved, root))) {
    throw new Error(
      `D2 file include must stay within the project directory${
        options.allowedIncludeRoots?.length ? ' or configured allowedIncludeRoots' : ''
      }: ${relativeFile} (resolved ${resolved})`,
    )
  }

  return resolved
}

export async function expandD2FileIncludes(tree: Root, file: VFile, options: FileIncludeOptions = {}) {
  const includes: { node: Code; relative: string }[] = []

  visit(tree, 'code', (node) => {
    if (node.lang !== 'd2') return
    const relative = parseFileAttribute(node.meta)
    if (!relative) return
    includes.push({ node, relative })
  })

  if (includes.length === 0) {
    return
  }

  const markdownPath = resolveMarkdownPath(file)
  if (!markdownPath) {
    const names = includes.map(({ relative }) => relative).join(', ')
    throw new Error(
      `D2 file= includes require a source path on the Markdown VFile (missing file.path/history). Includes: ${names}`,
    )
  }

  await Promise.all(
    includes.map(async ({ node, relative }) => {
      const fsPath = resolveD2FilePath(markdownPath, relative, { ...options, cwd: file.cwd })

      let source: string
      try {
        source = await fs.readFile(fsPath, 'utf8')
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        throw new Error(`Failed to read D2 include ${relative} for ${markdownPath}: ${message}`, { cause: error })
      }

      node.value = `${source.trimEnd()}\n`
      node.meta = stripFileAttribute(node.meta)
    }),
  )
}
