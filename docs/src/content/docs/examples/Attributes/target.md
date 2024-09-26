---
title: Target
---

Use the [`target` attribute](/attributes/#target) to define the target board to render when using [composition](https://d2lang.com/tour/composition).

````md title="src/content/docs/example.md" 'target="storefront"'
```d2 target="storefront"
# Root board
Content -> Website: Astro

layers: {
  # Board named "starlight" that does not inherit anything from root
  starlight: {
    Documentation -> Website: Starlight
  }

  # Board named "storefront" that does not inherit anything from root
  storefront: {
    E-commerce -> Website: Storefront
  }
}
```
````

The above code block will be rendered as the following diagram with only the `storefront` board being visible:

```d2 target="storefront"
# Root board
Content -> Website: Astro

layers: {
  # Board named "starlight" that does not inherit anything from root
  starlight: {
    Documentation -> Website: Starlight
  }

  # Board named "storefront" that does not inherit anything from root
  storefront: {
    E-commerce -> Website: Storefront
  }
}
```

:::note
You can use `root` to target the root board.
:::
