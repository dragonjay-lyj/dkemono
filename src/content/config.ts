import { defineCollection, z } from "astro:content";

export const collections = {
  artists: defineCollection({
    schema: z.object({
      name: z.string(), // Artist's name, required
      avatar: z.string(), // URL to artist's avatar image, required
      cover: z.string(), // URL to artist's cover image, required
      service: z.enum(["Patreon", "Fanbox", "Gumroad"]), // Service platform, required
    }),
  }),
  posts: defineCollection({
    schema: z.object({
      title: z.string(), // Post title, required
      cover: z.string(), // URL to post cover image, required
      artist: z.string(), // Associated artist name, required
      publishDate: z.date(), // Post publish date, required
      updateDate: z.date().optional(), // Post update date, optional
      tags: z.array(z.string()).default([]), // Tags for categorization, default to empty array
      attachments: z.number().default(0), // Number of attachments, default to 0
    }),
  }),
};