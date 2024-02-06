---
title: Theme
---

Use the [`theme` attribute](/attributes/#theme) to customize the theme of a diagram.

````md title="src/content/docs/example.md"
```d2 theme=102 darkTheme=false
x -> y: hello world
```
````

The above code block will be rendered as the following diagram with the `Shirley temple` theme:

```d2 theme=102 darkTheme=false
x -> y: hello world
```

:::note
The [`theme.default` configuration option](/configuration/#default) can be used to set the default theme for all diagrams.
:::
