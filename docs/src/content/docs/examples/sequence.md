---
title: Sequence
sidebar:
  order: 4
---

The Astro D2 integration can be used to create [sequence diagrams](https://d2lang.com/tour/sequence-diagrams):

````md title="src/content/docs/example.md"
```d2
shape: sequence_diagram

Alice -> Bob: What should I use to create diagrams?
Bob -> Alice: The Astro D2 integration
```
````

The above code block will be rendered as the following diagram:

```d2
shape: sequence_diagram

Alice -> Bob: What should I use to create diagrams?
Bob -> Alice: D2
```
