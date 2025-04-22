import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';

export async function GET(context) {
const posts = await getCollection('posts');
  return rss({
    site: context.site,
    title: 'Kemono',
    description: 'A Kemono website',
    items: posts.map((post) => ({
        title: post.data.title,
        pubDate: post.data.publishDate,
        description: post.body,
        link: `/posts/${post.id.replace(/\.mdx$/, '')}`,
      })),
  });
}