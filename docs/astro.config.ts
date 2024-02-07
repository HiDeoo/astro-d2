import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import astroD2 from 'astro-d2'

import { expressiveCodeD2Plugin } from './src/libs/ec'

export default defineConfig({
  integrations: [
    astroD2({
      skipGeneration: !!process.env['VERCEL'],
    }),
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/astro-d2/edit/main/docs/',
      },
      expressiveCode: { plugins: [expressiveCodeD2Plugin()] },
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
        github: 'https://github.com/HiDeoo/astro-d2',
      },
      title: 'Astro D2',
    }),
  ],
})
