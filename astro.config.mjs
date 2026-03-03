import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  // 末尾の記号などを含めず、正確に記述します
  site: 'https://amufaamo.github.io',
  integrations: [
    mdx(), 
    sitemap(), // sitemapがsite情報を正しく参照できるようにします
    tailwind()
  ],
});
