---
title: Source File
---

Use the [`src` attribute](/attributes/#src) to load a diagram source from an external `.d2` file instead of writing it inline in the Markdown code fence.
The path is resolved relative to the directory of the Markdown file.

Given a `src/content/docs/diagrams/architecture.d2` file, reference it from the code block:

````md title="src/content/docs/example.md" 'src="./diagrams/architecture.d2"'
```d2 src="./diagrams/architecture.d2" title="Architecture"
```
````

The above code block will be rendered as the following diagram loaded from the external file:

```d2 src="./_architecture.d2" title="Architecture"
```

:::note
The `src` attribute can be combined with any other attribute, such as [`title`](/attributes/#title) or [`theme`](/attributes/#theme), which still apply to the loaded diagram.
:::
