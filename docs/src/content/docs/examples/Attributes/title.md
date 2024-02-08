---
title: Title
---

Use the [`title` attribute](/attributes/#title) to specify a title for a diagram.

````md title="src/content/docs/example.md" 'title="My custom diagram"'
```d2 title="My custom diagram"
Content -> Website: Astro
```
````

The `title` attribute is used as the `alt` attribute of the generated image:

```html '"My custom diagram"'
<img alt="My custom diagram" … />
```
