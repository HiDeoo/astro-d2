---
title: Target
---

Use the [`target` attribute](/attributes/#target) to define the target board to render when using [composition](https://d2lang.com/tour/composition).

````md title="src/content/docs/example.md" "target=starlight"
```d2 target=starlight
# Root board
Content -> Website: Astro

layers: {
  # A different board named "starlight"
  starlight: {
    Documentation -> Website: Starlight
  }
}
```
````

The above code block will be rendered as the following diagram with only the `starlight` board being visible:

```d2 target=starlight
# Root board
Content -> Website: Astro

layers: {
  # Board named "starlight" that does not inherit anything from root
  starlight: {
    Documentation -> Website: Starlight
  }
}
```

:::note
You can use `root` to target the root board.
:::
