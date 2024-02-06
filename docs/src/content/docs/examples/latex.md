---
title: LaTeX
sidebar:
  order: 7
---

The Astro D2 integration can be used to create diagrams with [LaTeX](https://d2lang.com/tour/text#latex):

````md title="src/content/docs/example.md"
```d2
input -> output: electrolysis

input: {
  equation: |latex
    2 \\ce{NaCL} + 2 \\ce{H2O}
  |
}

output: {
  equation: |latex
    \\ce{Cl2} + \\ce{H2} + 2 \\ce{NaOH}
  |
}
```
````

The above code block will be rendered as the following diagram:

```d2
input -> output: electrolysis

input: {
  equation: |latex
    2 \\ce{NaCL} + 2 \\ce{H2O}
  |
}

output: {
  equation: |latex
    \\ce{Cl2} + \\ce{H2} + 2 \\ce{NaOH}
  |
}
```
