import { expect, test } from 'vitest'

import { parseMeta } from '../libs/meta'

test('returns no meta if no meta are defined', () => {
  const meta = parseMeta(undefined)

  expect(meta).toMatchObject({})
})

test('parses a basic unquoted key-value meta', () => {
  const meta = parseMeta('key=value')

  expect(meta).toEqual({ key: 'value' })
})

test('parses a basic key-value meta using single quotes', () => {
  const meta = parseMeta("key='the value'")

  expect(meta).toEqual({ key: 'the value' })
})

test('parses a basic key-value meta using double quotes', () => {
  const meta = parseMeta('key="the value"')

  expect(meta).toEqual({ key: 'the value' })
})

test('parses multiple key-value meta using mixed quotes', () => {
  const meta = parseMeta('key1="the value1" key2=value2 key3=\'the value3\'')

  expect(meta).toEqual({ key1: 'the value1', key2: 'value2', key3: 'the value3' })
})
