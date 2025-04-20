// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), sitemap(), mdx()],
  site: 'https://kemono.dragonjay.top',
  vite: {
    plugins: [tailwindcss()]
  },

  adapter: vercel(),
  output: 'server',
});