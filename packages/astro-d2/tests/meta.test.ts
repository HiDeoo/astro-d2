import { expect, test } from 'vitest'

import { getMeta } from '../libs/meta'

test('returns no meta if no meta are defined', () => {
  const meta = getMeta(undefined)

  expect(meta).toMatchObject({})
})

test('parses a basic unquoted key-value meta', () => {
  const meta = getMeta('title=value')

  expect(meta).toEqual({ title: 'value' })
})

test('parses a basic key-value meta using single quotes', () => {
  const meta = getMeta("title='the value'")

  expect(meta).toEqual({ title: 'the value' })
})

test('parses a basic key-value meta using double quotes', () => {
  const meta = getMeta('title="the value"')

  expect(meta).toEqual({ title: 'the value' })
})

test('parses multiple key-value meta using mixed quotes', () => {
  const meta = getMeta('darkTheme=\'the value1\' theme=value2 title="the value3"')

  expect(meta).toEqual({ darkTheme: 'the value1', theme: 'value2', title: 'the value3' })
})

test('strips unknown values', () => {
  const meta = getMeta('title=value foo=bar')

  expect(meta).toEqual({ title: 'value' })
})
