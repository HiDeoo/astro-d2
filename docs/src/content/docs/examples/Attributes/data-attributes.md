---
title: Data attributes
---

Use HTML [`data-*` attributes](/attributes/#data-attributes) to add custom data attributes to the generated diagram element.

````md title="src/content/docs/example.md" "data-testid=example"
```d2 data-testid=example
x -> y
```
````

The `data-testid` attribute is added to the generated `<img>` element:

```html 'data-testid="example"'
<img data-testid="example" ... />
```

If the [`inline`](/configuration/#inline) configuration option or [`inline` attribute](/attributes/#inline) is used, the attribute is added to the generated `<svg>` element:

```html 'data-testid="example"'
<svg data-testid="example" ...>...</svg>
```

Shorthand data attributes are set to `'true'`:

````md title="src/content/docs/example.md" "data-test"
```d2 data-test
x -> y
```
````

The above code block will be rendered with the `data-test` attribute set to `'true'`:

```html 'data-test="true"'
<img data-test="true" ... />
```
