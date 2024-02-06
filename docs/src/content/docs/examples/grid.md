---
title: Grid
sidebar:
  order: 5
---

The Astro D2 integration can be used to create [grid diagrams](https://d2lang.com/tour/grid-diagrams):

````md title="src/content/docs/example.md"
```d2
grid-columns: 3
Astro
Starlight
Studio {
  style.stroke-dash: 3
}
```
````

The above code block will be rendered as the following diagram:

```d2
grid-columns: 3
Astro
Starlight
Studio {
  style.stroke-dash: 3
}
```
