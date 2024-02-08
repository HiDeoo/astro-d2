---
title: Theme
---

Use the [`theme` attribute](/attributes/#theme) to customize the theme of a diagram.

````md title="src/content/docs/example.md" "theme=102"
```d2 theme=102 darkTheme=false
Content -> Website: Astro
```
````

The above code block will be rendered as the following diagram with the `Shirley temple` theme:

```d2 theme=102 darkTheme=false
Content -> Website: Astro
```

:::note
The [`theme.default` configuration option](/configuration/#default) can be used to set the default theme for all diagrams.
:::
