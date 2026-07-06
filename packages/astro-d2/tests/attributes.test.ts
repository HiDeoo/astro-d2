import { expect, test } from 'vitest'

import { AttributesSchema, getAttributes } from '../libs/attributes'

const defaultAttributes = AttributesSchema.parse({})

test('returns no attributes if no attributes are defined', () => {
  const attributes = getAttributes(undefined)

  expect(attributes).toEqual(defaultAttributes)
})

test('parses a basic unquoted key-value attribute', () => {
  const attributes = getAttributes('title=value')

  expect(attributes).toEqual({ ...defaultAttributes, title: 'value' })
})

test('parses a basic key-value attribute using single quotes', () => {
  const attributes = getAttributes("title='the value'")

  expect(attributes).toEqual({ ...defaultAttributes, title: 'the value' })
})

test('parses a basic key-value attribute using double quotes', () => {
  const attributes = getAttributes('title="the value"')

  expect(attributes).toEqual({ ...defaultAttributes, title: 'the value' })
})

test('parses multiple key-value attributes using mixed quotes', () => {
  const attributes = getAttributes('darkTheme=\'the value1\' theme=value2 title="the value3"')

  expect(attributes).toEqual({ ...defaultAttributes, darkTheme: 'the value1', theme: 'value2', title: 'the value3' })
})

test('strips unknown values', () => {
  const attributes = getAttributes('title=value foo=bar')

  expect(attributes).toEqual({ ...defaultAttributes, title: 'value' })
})

test('overrides default values', () => {
  const attributes = getAttributes('sketch=true')

  expect(attributes).toEqual({ ...defaultAttributes, sketch: 'true' })
})

test('transforms the `darkTheme` value to a boolean if set to `false`', () => {
  const attributes = getAttributes('darkTheme=false')

  expect(attributes).toEqual({ ...defaultAttributes, darkTheme: false })
})

test('supports a shorthand syntax for `sketch`', () => {
  const attributes = getAttributes('sketch')

  expect(attributes).toEqual({ ...defaultAttributes, sketch: 'true' })
})

test('transforms the `sketch` value to a boolean if set to `false`', () => {
  const attributes = getAttributes('sketch=false')

  expect(attributes).toEqual({ ...defaultAttributes, sketch: false })
})

test('supports coersed number for `pad` and `width`', () => {
  const attributes = getAttributes('pad=50 width=100')

  expect(attributes).toEqual({ ...defaultAttributes, pad: 50, width: 100 })
})

test('transforms the `target` root value to an empty string', () => {
  const attributes = getAttributes('target=root')

  expect(attributes).toEqual({ ...defaultAttributes, target: '' })
})

test('supports a shorthand syntax for `appendix`', () => {
  const attributes = getAttributes('appendix')

  expect(attributes).toEqual({ ...defaultAttributes, appendix: true })
})

test('transforms the `appendix` value to a boolean', () => {
  let attributes = getAttributes('appendix=false')

  expect(attributes).toEqual({ ...defaultAttributes, appendix: false })

  attributes = getAttributes('appendix=true')

  expect(attributes).toEqual({ ...defaultAttributes, appendix: true })
})

test('supports a shorthand syntax for `inline`', () => {
  const attributes = getAttributes('inline')

  expect(attributes).toEqual({ ...defaultAttributes, inline: true })
})

test('transforms the `inline` value to a boolean', () => {
  let attributes = getAttributes('inline=false')

  expect(attributes).toEqual({ ...defaultAttributes, inline: false })

  attributes = getAttributes('inline=true')

  expect(attributes).toEqual({ ...defaultAttributes, inline: true })
})

test('parses the `src` attribute', () => {
  const attributes = getAttributes('src="./fixtures/simple.d2"')

  expect(attributes).toEqual({ ...defaultAttributes, src: './fixtures/simple.d2' })
})

test('does not parse hyphenated unknown shorthand attributes as separate attributes', () => {
  const attributes = getAttributes('foo-sketch')

  expect(attributes).toEqual(defaultAttributes)
})

test('parses HTML data attributes', () => {
  const attributes = getAttributes('data-test=3 data-label="Hello world"')

  expect(attributes).toEqual({
    ...defaultAttributes,
    dataAttributes: { 'data-test': '3', 'data-label': 'Hello world' },
  })
})

test('parses unquoted HTML data attribute values with hyphens', () => {
  const attributes = getAttributes('data-testid=submit-button')

  expect(attributes).toEqual({ ...defaultAttributes, dataAttributes: { 'data-testid': 'submit-button' } })
})

test('supports a shorthand syntax for HTML data attributes', () => {
  const attributes = getAttributes('data-test')

  expect(attributes).toEqual({ ...defaultAttributes, dataAttributes: { 'data-test': 'true' } })
})

test('strips invalid HTML data attributes', () => {
  const attributes = getAttributes('data-test=3 data-Test=4 foo=bar')

  expect(attributes).toEqual({ ...defaultAttributes, dataAttributes: { 'data-test': '3' } })
})
