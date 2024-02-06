---
title: Target
---

Use the [`target` attribute](/attributes/#target) to defines the target board to render when using [composition](https://d2lang.com/tour/composition).

````md title="src/content/docs/example.md"
```d2 target=numbers
# Root board
x -> y
layers: {
  # Board named "numbers" that does not inherit anything from root
  numbers: {
    1 -> 2
  }
}
```
````

The above code block will be rendered as the following diagram with only the `numbers` board being visible:

```d2 target=numbers
# Root board
x -> y
layers: {
  # Board named "numbers" that does not inherit anything from root
  numbers: {
    1 -> 2
  }
}
```

:::note
You can use `root` to target the root board.
:::
