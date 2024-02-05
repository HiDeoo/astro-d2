import { expect, test } from 'vitest'

import { getMeta } from '../libs/meta'

test('returns no meta if no meta are defined', () => {
  const meta = getMeta(undefined)

  expect(meta).toEqual({ sketch: 'false', title: 'Diagram' })
})

test('parses a basic unquoted key-value meta', () => {
  const meta = getMeta('title=value')

  expect(meta).toEqual({ sketch: 'false', title: 'value' })
})

test('parses a basic key-value meta using single quotes', () => {
  const meta = getMeta("title='the value'")

  expect(meta).toEqual({ sketch: 'false', title: 'the value' })
})

test('parses a basic key-value meta using double quotes', () => {
  const meta = getMeta('title="the value"')

  expect(meta).toEqual({ sketch: 'false', title: 'the value' })
})

test('parses multiple key-value meta using mixed quotes', () => {
  const meta = getMeta('darkTheme=\'the value1\' theme=value2 title="the value3"')

  expect(meta).toEqual({ sketch: 'false', darkTheme: 'the value1', theme: 'value2', title: 'the value3' })
})

test('strips unknown values', () => {
  const meta = getMeta('title=value foo=bar')

  expect(meta).toEqual({ sketch: 'false', title: 'value' })
})

test('overrides default values', () => {
  const meta = getMeta('sketch=true')

  expect(meta).toEqual({ sketch: 'true', title: 'Diagram' })
})

test('transforms the darkTheme value to a boolean if set to `false`', () => {
  const meta = getMeta('darkTheme=false')

  expect(meta).toEqual({ darkTheme: false, sketch: 'false', title: 'Diagram' })
})
