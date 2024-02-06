---
title: Width
---

Use the [`width` attribute](/attributes/#width) to customize the width of a diagram in pixels instead of using the computed width.

````md title="src/content/docs/example.md"
```d2 width=50
x -> y: hello world
```
````

The above code block will be rendered as the following diagram with a width of 50 pixels:

```d2 width=50
x -> y: hello world
```

:::note
The height of the diagram will be adjusted to maintain the aspect ratio.
:::
