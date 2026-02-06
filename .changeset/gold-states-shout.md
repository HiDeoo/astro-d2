---
'astro-d2': minor
---

Adds experimental support for using [D2.js](https://www.npmjs.com/package/@terrastruct/d2) to render diagrams.

By default, the integration requires the D2 binary to be installed on the system to generate diagrams. Enabling this option allows generating diagrams using D2.js, a JavaScript wrapper around D2 to run it through WebAssembly.

To enable this feature, add the experimental flag in your Astro D2 integration configuration:

```js
astroD2({
  experimental: {
    useD2js: true
  }
})
```
