import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: 'https://amufaamo.github.io',
  // ここに sitemap() を追加します！順番はどこでも大丈夫です✨
  integrations: [mdx(), sitemap(), tailwind()]
});
