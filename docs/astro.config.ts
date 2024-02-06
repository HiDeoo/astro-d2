import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'
import astroD2 from 'astro-d2'

export default defineConfig({
  integrations: [
    astroD2(),
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/astro-d2/edit/main/docs/',
      },
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
