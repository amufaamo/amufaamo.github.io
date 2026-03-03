import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  // あなたのGitHubユーザー名に合わせてください
  site: 'https://amufaamo.github.io', 
  // リポジトリ名が「amufaamo.github.io」であれば '/' でOKです。
  // もし別の名前のリポジトリなら '/リポジトリ名' にしてください。
  base: '/', 
  integrations: [mdx(), sitemap(), tailwind()]
});
