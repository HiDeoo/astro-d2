---
title: Attributes
description: An overview of all the attributes supported by the Astro D2 integration.
---

The Astro D2 integration can be globally [configured](/configuration/) inside the `astro.config.mjs` configuration file of your project.
In addition, individual diagrams can be customized using attributes.

Attributes are annotations that can be added to the opening code fence of a D2 diagram Markdown code block after the three backticks and the language identifier <code>```d2</code>.

````md title="src/content/docs/example.md" "foo=bar baz"
```d2 foo=bar baz
x -> y
```
````

In the above example, the `foo` attribute is set to `bar` and the `baz` attribute is set to `true`.

## Attributes

All attributes are optional and can be combined together.
The following attributes are supported by the Astro D2 integration:

### `animateInterval`

**Example**: [Animate interval attribute](/examples/attributes/animate-interval/)

When specified, the diagram will package multiple boards as 1 SVG which transitions through each board at the specified interval (in milliseconds).

````md title="src/content/docs/example.md" "animateInterval=1000"
```d2 animateInterval=1000
x -> y

layers: {
  numbers: {
    1 -> 2
  }
}
```
````

### `darkTheme`

**Example**: [Dark theme attribute](/examples/attributes/dark-theme/)

The dark theme to use for the diagrams when the user's system preference is set to dark mode.
To disable the dark theme and have all diagrams look the same, set this attribute to `'false'`.

````md title="src/content/docs/example.md" "darkTheme=301"
```d2 darkTheme=301
x -> y
```
````

See the D2 documentation for more information about the available [themes](https://d2lang.com/tour/themes).

### `pad`

**Default:** `'100'`  
**Example**: [Padding attribute](/examples/attributes/padding/)

The padding (in pixels) around the rendered diagram.

````md title="src/content/docs/example.md" "pad=10"
```d2 pad=10
x -> y
```
````

### `sketch`

**Default:** `'false'`  
**Example**: [Sketch attribute](/examples/attributes/sketch/)

Whether to render the diagram as if it was sketched by hand.

````md title="src/content/docs/example.md" "sketch"
```d2 sketch
x -> y
```
````

### `target`

**Example**: [Target attribute](/examples/attributes/target/)

Defines the target board to render when using [composition](https://d2lang.com/tour/composition).
Use `root` to target the root board.

````md title="src/content/docs/example.md" "target=numbers"
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

### `title`

**Example**: [Title attribute](/examples/attributes/title/)

The title of the diagram that will be used as the `alt` attribute of the generated image.

````md title="src/content/docs/example.md" 'title="My custom diagram"'
```d2 title="My custom diagram"
x -> y
```
````

### `theme`

**Example**: [Theme attribute](/examples/attributes/theme/)

The default theme to use for the diagrams.

````md title="src/content/docs/example.md" "theme=102"
```d2 theme=102
x -> y
```
````

See the D2 documentation for more information about the available [themes](https://d2lang.com/tour/themes).

### `width`

**Example**: [Width attribute](/examples/attributes/width/)

The width (in pixels) of the diagram.
The height of the diagram will be adjusted to maintain the aspect ratio.

````md title="src/content/docs/example.md" "width=50"
```d2 width=50
x -> y
```
````
