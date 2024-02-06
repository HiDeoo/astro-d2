---
title: How Astro D2 Works?
description: Learn more about how the Astro D2 integration works to create diagrams with D2.
next: false
---

The Astro D2 integration is an Astro [integration](https://docs.astro.build/en/guides/integrations-guide/) embedding a [remark](https://remark.js.org/) plugin to transform [D2](https://d2lang.com/) Markdown code blocks into diagrams.

## Command-line tool

The most common way to use D2 is to [install](https://github.com/terrastruct/d2/blob/master/docs/INSTALL.md) and use the official D2 command-line tool. The D2 CLI can be used to render D2 code into diagrams.

When writing Markdown (or MDX) content in your Astro project, the Astro D2 integration will automatically transform D2 Markdown code blocks into diagrams using the D2 CLI that you must have installed on your machine.
The diagrams will be rendered as SVG images and be saved in the `public/d2/` directory of your Astro project.

:::note

The `d2` directory name used in the above description can be modified using the [`output` configuration option](/configuration/#output).

:::

## Deployment

When deploying your Astro site, you will need to ensure that the D2 binary is available on the deployment platform.
D2 can be [installed](https://github.com/terrastruct/d2/blob/master/docs/INSTALL.md) on many platforms, including Windows, macOS, and Linux using different methods such as various package managers, Docker, or manual installation.

On some deployment platforms, the D2 binary might not be available or may be difficult to install.
In such cases, you can use the [`skipGeneration` configuration option](/configuration/#skipgeneration) to disable the generation of diagrams on specific platforms.

When using this option, you will need to [build](https://docs.astro.build/en/reference/cli-reference/#astro-build) and commit the generated diagrams before deploying your site.

```js {8-9}
// astro.config.mjs
import { defineConfig } from 'astro/config'
import astroD2 from 'astro-d2'

export default defineConfig({
  integrations: [
    astroD2({
      // Disable generating diagrams when deploying on Vercel.
      skipGeneration: !!process.env['VERCEL'],
    }),
  ],
})
```
