import { expect, test } from 'vitest'

import { MetaSchema, getMeta } from '../libs/meta'

const defaultMeta = MetaSchema.parse({})

test('returns no meta if no meta are defined', () => {
  const meta = getMeta(undefined)

  expect(meta).toEqual(defaultMeta)
})

test('parses a basic unquoted key-value meta', () => {
  const meta = getMeta('title=value')

  expect(meta).toEqual({ ...defaultMeta, title: 'value' })
})

test('parses a basic key-value meta using single quotes', () => {
  const meta = getMeta("title='the value'")

  expect(meta).toEqual({ ...defaultMeta, title: 'the value' })
})

test('parses a basic key-value meta using double quotes', () => {
  const meta = getMeta('title="the value"')

  expect(meta).toEqual({ ...defaultMeta, title: 'the value' })
})

test('parses multiple key-value meta using mixed quotes', () => {
  const meta = getMeta('darkTheme=\'the value1\' theme=value2 title="the value3"')

  expect(meta).toEqual({ ...defaultMeta, darkTheme: 'the value1', theme: 'value2', title: 'the value3' })
})

test('strips unknown values', () => {
  const meta = getMeta('title=value foo=bar')

  expect(meta).toEqual({ ...defaultMeta, title: 'value' })
})

test('overrides default values', () => {
  const meta = getMeta('sketch=true')

  expect(meta).toEqual({ ...defaultMeta, sketch: 'true' })
})

test('transforms the `darkTheme` value to a boolean if set to `false`', () => {
  const meta = getMeta('darkTheme=false')

  expect(meta).toEqual({ ...defaultMeta, darkTheme: false })
})

test('supports a shorthand syntax for `sketch`', () => {
  const meta = getMeta('sketch')

  expect(meta).toEqual({ ...defaultMeta, sketch: 'true' })
})

test('supports coersed number for `pad`', () => {
  const meta = getMeta('pad=50')

  expect(meta).toEqual({ ...defaultMeta, pad: 50 })
})
