---
title: Icons
sidebar:
  order: 3
---

The Astro D2 integration can be used to create diagrams with [icons](https://d2lang.com/tour/icons):

````md title="src/content/docs/example.md"
```d2
container: Docker {
  icon: https://icons.terrastruct.com/dev%2Fdocker.svg
  style: {
    stroke: deepskyblue
    font-color: deepskyblue
    fill: white
  }
  nginx: NGINX {
    icon: https://icons.terrastruct.com/dev%2Fnginx.svg
    style: {
      stroke: green
      font-color: green
      stroke-dash: 3
      fill: white
    }
    astro: Astro {
      style: {
        stroke: "#d841c1"
        font-color: white
        fill: "#75297f"
      }
    }
  }
}
```
````

The above code block will be rendered as the following diagram:

```d2
container: Docker {
  icon: https://icons.terrastruct.com/dev%2Fdocker.svg
  style: {
    stroke: deepskyblue
    font-color: deepskyblue
    fill: white
  }
  nginx: NGINX {
    icon: https://icons.terrastruct.com/dev%2Fnginx.svg
    style: {
      stroke: green
      font-color: green
      stroke-dash: 3
      fill: white
    }
    astro: Astro {
      style: {
        stroke: "#d841c1"
        font-color: white
        fill: "#75297f"
      }
    }
  }
}
```

:::tip
A collection of icons commonly found in software architecture diagrams is hosted for free by Terrastruct: https://icons.terrastruct.com
:::
