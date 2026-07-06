# astro-d2

## 0.13.0

### Minor Changes

- [#61](https://github.com/HiDeoo/astro-d2/pull/61) [`5155733`](https://github.com/HiDeoo/astro-d2/commit/515573349fbe5b6536eea1a671391680a2810601) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for specifying HTML data attributes on D2 code fences.

  Data attributes are added to the generated element when rendering diagrams. This can be useful, for example, when combined with the [`starlight-image-zoom`](https://github.com/HiDeoo/starlight-image-zoom) plugin to disable zooming for some diagrams using the `data-zoom-off` attribute.

## 0.12.0

### Minor Changes

- [#59](https://github.com/HiDeoo/astro-d2/pull/59) [`67958c0`](https://github.com/HiDeoo/astro-d2/commit/67958c0e22e5a4e35ee4d42ea40263ec40df5de7) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for Astro v7, drops support for Astro v6.

  #### Upgrade Astro and dependencies

  ⚠️ **BREAKING CHANGE:** Astro v6 is no longer supported. Make sure you [update Astro](https://docs.astro.build/en/guides/upgrade-to/v7/) and any other official integrations at the same time:

  ```sh
  npx @astrojs/upgrade
  ```

- [#59](https://github.com/HiDeoo/astro-d2/pull/59) [`67958c0`](https://github.com/HiDeoo/astro-d2/commit/67958c0e22e5a4e35ee4d42ea40263ec40df5de7) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for the Sätteri Markdown processor.

## 0.11.0

### Minor Changes

- [#54](https://github.com/HiDeoo/astro-d2/pull/54) [`3b2672c`](https://github.com/HiDeoo/astro-d2/commit/3b2672c49518160e31e5984310720b588b3ae587) Thanks [@joesaby](https://github.com/joesaby)! - Adds a new `src` code fence attribute to load a diagram source from an external `.d2` file relative to the Markdown file.

## 0.10.0

### Minor Changes

- [#51](https://github.com/HiDeoo/astro-d2/pull/51) [`b64ed5e`](https://github.com/HiDeoo/astro-d2/commit/b64ed5e1331598e6fb00df8972bb2bacf3e742fa) Thanks [@HiDeoo](https://github.com/HiDeoo)! - Adds support for Astro v6, drops support for Astro v5.

  ⚠️ **BREAKING CHANGE:** The minimum supported version of Astro is now `6.0.0`.

  Please follow the [upgrade guide](https://docs.astro.build/en/guides/upgrade-to/v6/) to update your project.

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
