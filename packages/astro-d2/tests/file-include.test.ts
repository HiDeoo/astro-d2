import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from 'vitest'
import { VFile } from 'vfile'

import {
  isPathInsideRoot,
  parseFileAttribute,
  resolveD2FilePath,
  resolveMarkdownPath,
  stripFileAttribute,
} from '../libs/file-include'

const testsDir = fileURLToPath(new URL('.', import.meta.url))
const fixturesDir = fileURLToPath(new URL('fixtures/', import.meta.url))
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const repoRoot = fileURLToPath(new URL('../../..', import.meta.url))

test('parseFileAttribute parses unquoted, single-quoted, and double-quoted paths', () => {
  expect(parseFileAttribute('file=./foo.d2')).toBe('./foo.d2')
  expect(parseFileAttribute('file="./bar.d2" title="Test"')).toBe('./bar.d2')
  expect(parseFileAttribute("file='./baz.d2' theme=1")).toBe('./baz.d2')
  expect(parseFileAttribute('title=Diagram')).toBeNull()
})

test('stripFileAttribute removes file= from meta', () => {
  expect(stripFileAttribute('file=./foo.d2 title="Test"')).toBe('title="Test"')
  expect(stripFileAttribute('file="./foo.d2"')).toBeNull()
})

test('resolveMarkdownPath normalizes file:// URLs', () => {
  const mdPath = fileURLToPath(new URL('index.md', import.meta.url))
  const file = new VFile({
    cwd: packageRoot,
    path: `file://${mdPath}`,
  })

  expect(resolveMarkdownPath(file)).toBe(mdPath)
})

test('resolveMarkdownPath falls back to file.history', () => {
  const mdPath = fileURLToPath(new URL('index.md', import.meta.url))
  const file = new VFile({
    cwd: packageRoot,
    path: undefined,
    history: [mdPath],
  })

  expect(resolveMarkdownPath(file)).toBe(mdPath)
})

test('resolveMarkdownPath falls back to file.data.astro.id relative to cwd', () => {
  const file = new VFile({
    cwd: packageRoot,
    data: { astro: { id: 'docs/example' } },
  })

  expect(resolveMarkdownPath(file)).toBe(path.join(packageRoot, 'docs/example.md'))
})

test('resolveD2FilePath resolves relative to the markdown directory', () => {
  const markdownPath = fileURLToPath(new URL('index.md', import.meta.url))
  const resolved = resolveD2FilePath(markdownPath, './fixtures/simple.d2', { cwd: packageRoot })

  expect(resolved).toBe(path.join(fixturesDir, 'simple.d2'))
})

test('resolveD2FilePath rejects paths outside the project root', () => {
  const markdownPath = fileURLToPath(new URL('index.md', import.meta.url))

  expect(() => resolveD2FilePath(markdownPath, '../../../../etc/passwd', { cwd: packageRoot })).toThrow(
    /must stay within the project directory/,
  )
})

test('resolveD2FilePath allows configured allowedIncludeRoots', () => {
  const markdownPath = fileURLToPath(new URL('index.md', import.meta.url))
  const outsidePackage = path.join(repoRoot, 'test-assets/outside.d2')

  expect(() =>
    resolveD2FilePath(markdownPath, '../../../test-assets/outside.d2', { cwd: packageRoot }),
  ).toThrow()

  const resolved = resolveD2FilePath(markdownPath, '../../../test-assets/outside.d2', {
    cwd: packageRoot,
    allowedIncludeRoots: ['../../test-assets'],
  })

  expect(resolved).toBe(outsidePackage)
})

test('isPathInsideRoot matches paths under a root', () => {
  expect(isPathInsideRoot(fixturesDir, testsDir)).toBe(true)
  expect(isPathInsideRoot(repoRoot, packageRoot)).toBe(false)
})
