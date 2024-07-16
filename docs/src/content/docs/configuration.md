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

This is useful to disable generating diagrams when deploying on platforms that do not have D2 installed or cannot be easily installed.
This will require you to [build](https://docs.astro.build/en/reference/cli-reference/#astro-build) and commit diagrams before deploying your site.

Read more about deploying your site in the [“Deployment”](/guides/how-astro-d2-works/#deployment) guide.

### `layout`

**Type:** `'dagre' | 'elk' | 'tala'`  
**Default:** `'dagre'`

Defines the layout engine to use to generate the diagrams.
See the D2 documentation for more information about the available [layout engines](https://d2lang.com/tour/layouts#layout-engines).

### `sketch`

**Type:** `boolean`  
**Default:** `false`

Whether to render the diagrams as if they were sketched by hand.

### `pad`

**Type:** `number`  
**Default:** `100`

The padding (in pixels) around the rendered diagrams.

### `fonts`

**Type:** [`AstroD2FontsConfig`](#fonts-configuration)

The fonts to use for the generated diagrams.

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
To disable the dark theme, set this option to `false`.

See the D2 documentation for more information about the available [themes](https://d2lang.com/tour/themes).

---

## Fonts configuration

The fonts configuration is an object used to configure the fonts used for the generated diagrams.
It accepts the following options:

### `regular`

**Type:** `string`

The relative path from the project's root to the `.ttf` font file to use for the regular font.

### `italic`

**Type:** `string`

The relative path from the project's root to the `.ttf` font file to use for the italic font.

### `bold`

**Type:** `string`

The relative path from the project's root to the `.ttf` font file to use for the bold font.
