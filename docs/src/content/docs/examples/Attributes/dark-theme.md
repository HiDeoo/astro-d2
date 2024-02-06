---
title: Dark theme
---

Use the [`darkTheme` attribute](/attributes/#darktheme) to customize the dark theme of a diagram.

````md title="src/content/docs/example.md" "darkTheme=301"
```d2 theme=301 darkTheme=301
Content -> Website: Astro
```
````

The above code block will be rendered as the following diagram with the `Terminal grayscale` dark theme:

```d2 theme=301 darkTheme=301
Content -> Website: Astro
```

:::note
The [`theme.dark` configuration option](/configuration/#dark) can be used to set the default dark theme for all diagrams.
:::
