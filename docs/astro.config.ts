import starlight from '@astrojs/starlight'
import { defineConfig } from 'astro/config'

export default defineConfig({
  integrations: [
    starlight({
      customCss: ['./src/styles/custom.css'],
      editLink: {
        baseUrl: 'https://github.com/HiDeoo/astro-d2/edit/main/docs/',
      },
      sidebar: [
        {
          label: 'Start Here',
          items: [{ label: 'Getting Started', link: '/getting-started/' }],
        },
      ],
      social: {
        github: 'https://github.com/HiDeoo/astro-d2',
      },
      title: 'Astro D2',
    }),
  ],
})
