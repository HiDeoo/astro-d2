# astro-d2

## 0.9.0

### Minor Changes

- [#49](https://github.com/HiDeoo/astro-d2/pull/49) [`68bfe04`](https://github.com/HiDeoo/astro-d2/commit/68bfe04b6098c748beb4ffc24c595419917d5a4c) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds new `inline` attribute to override the global `inline` configuration for a specific diagram.

- [#49](https://github.com/HiDeoo/astro-d2/pull/49) [`68bfe04`](https://github.com/HiDeoo/astro-d2/commit/68bfe04b6098c748beb4ffc24c595419917d5a4c) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for customizing the semibold font in diagrams.

- [#49](https://github.com/HiDeoo/astro-d2/pull/49) [`68bfe04`](https://github.com/HiDeoo/astro-d2/commit/68bfe04b6098c748beb4ffc24c595419917d5a4c) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds experimental support for using [D2.js](https://www.npmjs.com/package/@terrastruct/d2) to render diagrams.

  By default, the integration requires the D2 binary to be installed on the system to generate diagrams. Enabling this option allows generating diagrams using D2.js, a JavaScript wrapper around D2 to run it through WebAssembly.

  To enable this feature, add the experimental flag in your Astro D2 integration configuration:

  ```js
  astroD2({
    experimental: {
      useD2js: true,
    },
  })
  ```

## 0.8.1

### Patch Changes

- [#47](https://github.com/HiDeoo/astro-d2/pull/47) [`7d1c6e0`](https://github.com/HiDeoo/astro-d2/commit/7d1c6e0c9759475ca470178e9947af698c096d0e) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Setups trusted publishing using OpenID Connect (OIDC) authentication — no code changes.

## 0.8.0

### Minor Changes

- [#41](https://github.com/HiDeoo/astro-d2/pull/41) [`b2d3f4b`](https://github.com/HiDeoo/astro-d2/commit/b2d3f4ba8b1a2aefda7733df67ffe11c4f348d84) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds a configuration option and attribute to add an appendix to diagrams with [tooltips or links](https://d2lang.com/tour/interactive/).

## 0.7.0

### Minor Changes

- [#34](https://github.com/HiDeoo/astro-d2/pull/34) [`7028b05`](https://github.com/HiDeoo/astro-d2/commit/7028b0569eab2479808f38e6140a8b3d8a6a8db9) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for Astro v5, drops support for Astro v4.

  ⚠️ **BREAKING CHANGE:** The minimum supported version of Astro is now `5.0.0`.

  Please follow the [upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v5/) to update your project.

  When using the integration with the [Content Layer API](https://docs.astro.build/en/guides/content-collections) and the [`skipGeneration` option](https://astro-d2.vercel.app/configuration/#skipgeneration) is set to `false`, the integration will automatically invalidate the content layer cache at build time so that all existing diagrams can be generated while ensuring that all removed diagrams are properly cleaned up. This limitation will be removed if and when some upstream technical blockers are resolved.
