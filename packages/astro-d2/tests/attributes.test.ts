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
