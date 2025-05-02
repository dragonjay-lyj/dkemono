import { defineCollection, z } from 'astro:content';

const artistSchema = z.object({
  name: z.string(),
  avatar: z.string(),
  cover: z.string(),
  service: z.enum(['Patreon', 'Fanbox', 'Gumroad']),
  serviceUrl: z.string().url().optional(), // 画师服务页面链接
  bio: z.string().optional(), // 画师简介
});

const postSchema = z.object({
  title: z.string(),
  cover: z.string(),
  artist: z.string(), // 关联画师名称
  publishDate: z.date(),
  updateDate: z.date().optional(),
  tags: z.array(z.string()).default([]), // 帖子标签
  attachments: z.number(), // 附件数量
});

export const collections = {
  artists: defineCollection({ schema: artistSchema }),
  posts: defineCollection({ schema: postSchema }),
};