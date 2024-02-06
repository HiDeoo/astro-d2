---
title: Configuration
description: An overview of all the configuration options supported by the Astro D2 integration.
---

The Astro D2 integration can be configured inside the `astro.config.mjs` configuration file of your project:

```js {8}
// astro.config.mjs
import { defineConfig } from 'astro/config'
import astroD2 from 'astro-d2'

export default defineConfig({
  integrations: [
    astroD2({
      // Configuration options go here.
    }),
  ],
})
```

## Configuration options

The Astro D2 integration accepts the following configuration options:

### `theme`

**Type:** [`AstroD2ThemeConfig`](#theme-configuration)

The themes to use for the generated diagrams.

### `output`

**Type:** `string`  
**Default:** `'d2'`

The name of the output directory containing the generated diagrams relative to the `public/` directory.

### `skipGeneration`

**Type:** `boolean`  
**Default:** `false`

Whether the Astro D2 integration should skip the generation of diagrams.

This is useful to disable generating diagrams when deploying on platforms that do not have the D2 binary available. This will require you to build and commit the diagrams before deploying your site.

### `layout`

**Type:** `'dagre' | 'elk' | 'tala'`  
**Default:** `'dagre'`

Defines the layout engine to use to generate the diagrams.
See the D2 documentation for more information about the available [layout engines](https://d2lang.com/tour/layouts#layout-engines).

---

## Theme configuration

The theme configuration is an object used to configure the themes used for the generated diagrams.
It accepts the following options:

### `default`

**Type:** `string`  
**Default:** `'0'`

The default theme to use for the diagrams.

See the D2 documentation for more information about the available [themes](https://d2lang.com/tour/themes).

### `dark`

**Type:** `string | false`  
**Default:** `'200'`

The dark theme to use for the diagrams when the user's system preference is set to dark mode.
To disable the dark theme and have all diagrams look the same, set this option to `false`.

See the D2 documentation for more information about the available [themes](https://d2lang.com/tour/themes).
