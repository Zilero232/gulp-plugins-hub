import { defineConfig } from 'vitepress';
import llmstxt from 'vitepress-plugin-llms';

const REPO = 'https://github.com/Zilero232/gulp-plugins-hub';
const SITE = 'https://zilero232.github.io/gulp-plugins-hub/';
const DESCRIPTION =
  'Typed gulp 5 plugins for HTML, Pug, Sass, CSS, JavaScript, images, fonts, archives and cache-busting, and the factory to build your own.';

/** Every plugin page, in the order of the sidebar groups. */
const PLUGIN_GROUPS = [
  {
    text: 'Compile',
    items: [
      { text: 'pug-compiler', link: '/plugins/pug-compiler' },
      { text: 'scss-compiler', link: '/plugins/scss-compiler' }
    ]
  },
  {
    text: 'Optimize',
    items: [
      { text: 'html-squeezer', link: '/plugins/html-squeezer' },
      { text: 'css-squeezer', link: '/plugins/css-squeezer' },
      { text: 'js-squeezer', link: '/plugins/js-squeezer' },
      { text: 'image-squeezer', link: '/plugins/image-squeezer' },
      { text: 'font-switcher', link: '/plugins/font-switcher' }
    ]
  },
  {
    text: 'Transform',
    items: [
      { text: 'file-concat', link: '/plugins/file-concat' },
      { text: 'text-replace', link: '/plugins/text-replace' },
      { text: 'refilename', link: '/plugins/refilename' },
      { text: 'asset-revision', link: '/plugins/asset-revision' },
      { text: 'archive-creator', link: '/plugins/archive-creator' }
    ]
  },
  {
    text: 'Route and filter',
    items: [
      { text: 'conditional', link: '/plugins/conditional' },
      { text: 'file-exclude', link: '/plugins/file-exclude' },
      { text: 'file-changed', link: '/plugins/file-changed' },
      { text: 'folder-clone', link: '/plugins/folder-clone' }
    ]
  }
];

// Lets search engines and AI assistants read the project as software, not as a random page.
const STRUCTURED_DATA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareSourceCode',
  name: 'gulp-plugins-hub',
  description: DESCRIPTION,
  programmingLanguage: 'TypeScript',
  runtimePlatform: 'Node.js',
  license: 'https://opensource.org/licenses/MIT',
  url: SITE,
  codeRepository: REPO
};

export default defineConfig({
  title: 'gulp-plugins-hub',
  description: DESCRIPTION,
  base: '/gulp-plugins-hub/',
  lang: 'en-US',
  cleanUrls: true,
  vite: {
    // llms.txt and llms-full.txt: the docs as plain Markdown for AI assistants (https://llmstxt.org).
    plugins: [llmstxt()]
  },
  lastUpdated: true,
  sitemap: { hostname: SITE },
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/gulp-plugins-hub/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#7c3aed' }],
    [
      'meta',
      {
        name: 'keywords',
        content: 'gulp, gulp 5, gulp plugin, gulpplugin, pug, sass, lightningcss, terser, sharp, webp, avif, woff2'
      }
    ],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'gulp-plugins-hub' }],
    ['meta', { property: 'og:title', content: 'gulp-plugins-hub' }],
    ['meta', { property: 'og:description', content: DESCRIPTION }],
    ['meta', { property: 'og:url', content: SITE }],
    ['meta', { name: 'twitter:card', content: 'summary' }],
    ['script', { type: 'application/ld+json' }, JSON.stringify(STRUCTURED_DATA)]
  ],
  // A canonical URL per page, so copies and the trailing-slash variant do not compete with it.
  transformPageData: (pageData) => {
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '');

    pageData.frontmatter.head ??= [];
    pageData.frontmatter.head.push(['link', { rel: 'canonical', href: `${SITE}${path}` }]);
  },
  themeConfig: {
    logo: '/logo.svg',
    nav: [
      { text: 'Guide', link: '/guide/getting-started', activeMatch: '/guide/' },
      { text: 'Plugins', link: '/plugins/', activeMatch: '/plugins/' },
      { text: 'Reference', link: '/reference/factory', activeMatch: '/reference/' },
      { text: 'Changelogs', link: `${REPO}/tree/master/packages` }
    ],
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting started', link: '/guide/getting-started' },
            { text: 'Gulp 5 essentials', link: '/guide/gulp-5' },
            { text: 'Recipes', link: '/guide/recipes' },
            { text: 'Writing a plugin', link: '/guide/writing-plugins' },
            { text: 'Migrating from 1.x', link: '/guide/migration' }
          ]
        }
      ],
      '/plugins/': [{ text: 'Overview', link: '/plugins/' }, ...PLUGIN_GROUPS],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Plugin factory', link: '/reference/factory' },
            { text: 'Testing helpers', link: '/reference/testing' }
          ]
        }
      ]
    },
    socialLinks: [
      { icon: 'github', link: REPO },
      { icon: 'npm', link: 'https://www.npmjs.com/org/zilero' }
    ],
    editLink: { pattern: `${REPO}/edit/master/apps/docs/:path`, text: 'Edit this page on GitHub' },
    search: { provider: 'local' },
    outline: [2, 3],
    footer: { message: 'Released under the MIT License.', copyright: 'Copyright © 2024-present Artemev Alexandr' }
  }
});
