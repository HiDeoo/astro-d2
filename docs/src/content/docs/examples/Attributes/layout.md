---
title: Layout
---

Use the [`layout` attribute](/attributes/#layout) to use a different layout engine to generate the diagram.

````md title="src/content/docs/example.md" "layout=elk"
```d2 layout=elk
Content -> Website -> Content
```
````

The above code block will be rendered as the following diagram with the ELK layout engine:

```d2 layout=elk
Content -> Website -> Content
```
