import { defineCollection, z } from 'astro:content'
import { rssSchema } from '@astrojs/rss'
import { glob } from 'astro/loaders'

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/blog' }),
  schema: rssSchema
})

const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/works' }),
  schema: z.object({
    title: z.string(),
    thumbnail: z.string(),
    link: z.string(),
    order: z.number().default(0) // 表示順を制御したい場合に便利です
  })
})

export const collections = { blog, works }
