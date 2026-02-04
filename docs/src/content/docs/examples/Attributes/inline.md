---
title: Inline
---

Use the [`inline` attribute](/attributes/#inline) to define if the SVG diagram should be inlined in the HTML output.

````md title="src/content/docs/example.md" "inline"
```d2 inline
x -> y
```
````

The above code block will be rendered with an inline SVG diagram in the HTML output:

```html
<svg>...</svg>
```

By default, the diagrams are rendered using the `<img>` tag.

###
