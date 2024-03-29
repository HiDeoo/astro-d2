---
title: Animate interval
---

Use the [`animateInterval` attribute](/attributes/#animateinterval) to package multiple boards as 1 SVG which transitions through each board at the specified interval (in milliseconds).

````md title="src/content/docs/example.md" "animateInterval=1000"
```d2 animateInterval=1000
How does the cat go?

layers: {
  cat: {
    Meooooooooowwww
  }
}
```
````

The above code block will be rendered as the following diagram with an animate interval of 1 second:

```d2 animateInterval=1000
How does the cat go?

layers: {
  cat: {
    Meooooooooowwww
  }
}
```
