import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import astroD2 from 'astro-d2'

import { expressiveCodeD2Plugin } from './src/libs/ec'

const site =
  process.env['VERCEL_ENV'] !== 'production' && process.env['VERCEL_URL']
    ? `https://${process.env['VERCEL_URL']}`
    : 'https://astro-d2.vercel.app/'

export default defineConfig({
  integrations: [
    astroD2({ experimental: { useD2js: true } }),
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/astro-d2/edit/main/docs/',
      },
      expressiveCode: { plugins: [expressiveCodeD2Plugin()] },
      head: [
        {
          tag: 'meta',
          attrs: { property: 'og:image', content: new URL('og.jpg', site).href },
        },
        {
          tag: 'meta',
          attrs: {
            property: 'og:image:alt',
            content: 'Astro integration and remark plugin to transform D2 Markdown code blocks into diagrams.',
          },
        },
      ],
      sidebar: [
        {
          label: 'Start Here',
          items: [
            { label: 'Getting Started', link: '/getting-started/' },
            { label: 'Configuration', link: '/configuration/' },
            { label: 'Attributes', link: '/attributes/' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Why D2?', link: '/guides/why-d2/' },
            { label: 'How Astro D2 Works?', link: '/guides/how-astro-d2-works/' },
          ],
        },
        {
          label: 'Examples',
          autogenerate: { directory: 'examples' },
        },
      ],
      social: {
        blueSky: 'https://bsky.app/profile/hideoo.dev',
        github: 'https://github.com/HiDeoo/astro-d2',
      },
      title: 'Astro D2',
    }),
  ],
  site,
})
