import { defineConfig } from 'vitepress'

export default defineConfig({
    base: '/flash-fill-dev/',
    title: "Flash Fill",
    description: "Intellegent Form Autofill for Developers",
    themeConfig: {
        logo: '/logo.png',
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Matching Guide', link: '/MATCHING' },
            { text: 'NPM', link: 'https://www.npmjs.com/package/@aravindh-arumugam/flash-fill' }
        ],
        sidebar: [
            {
                text: 'Introduction',
                items: [
                    { text: 'Overview', link: '/' },
                    { text: 'Installation', link: '/installation' },
                ]
            },
            {
                text: 'Intelligence',
                items: [
                    { text: 'Matching Dictionary', link: '/MATCHING' },
                    { text: 'Global Standards', link: '/global-standards' },
                ]
            }
        ],
        socialLinks: [
            { icon: 'github', link: 'https://github.com/aravindh-mb/flash-fill-dev' }
        ],
        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2025-present Aravindh Arumugam'
        }
    }
})
