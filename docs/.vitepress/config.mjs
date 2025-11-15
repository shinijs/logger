import { defineConfig } from 'vitepress';

export default defineConfig({
  title: '@shinijs/logger',
  description: 'Pino-based structured logger for NestJS applications with file rotation and pretty printing',
  
  base: '/logger/',
  
  head: [
    ['link', { rel: 'icon', href: '/logger/favicon.ico' }],
  ],

  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/logger-module' },
      { text: 'Examples', link: '/guide/examples' },
      {
        text: 'Links',
        items: [
          { text: 'GitHub', link: 'https://github.com/shinijs/logger' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@shinijs/logger' },
          { text: 'Changelog', link: 'https://github.com/shinijs/logger/blob/master/CHANGELOG.md' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Examples', link: '/guide/examples' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'LoggerModule', link: '/api/logger-module' },
            { text: 'CustomLogger', link: '/api/custom-logger' },
            { text: 'LoggerFactory', link: '/api/logger-factory' },
            { text: 'Interfaces', link: '/api/interfaces' },
            { text: 'Configuration', link: '/api/config' },
          ],
        },
      ],
      '/advanced/': [
        {
          text: 'Advanced',
          items: [
            { text: 'File Rotation', link: '/advanced/file-rotation' },
            { text: 'Context Logging', link: '/advanced/context-logging' },
            { text: 'Best Practices', link: '/advanced/best-practices' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/shinijs/logger' },
    ],

    search: {
      provider: 'local',
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 Shironex',
    },
  },
});

