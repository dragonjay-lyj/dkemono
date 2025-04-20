import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';

// 简单的内存缓存，存储最近的查询结果以提升性能
const cache = new Map<string, any>();
const CACHE_DURATION = 60 * 1000; // 缓存持续时间：1分钟
// 速率限制：简单的内存存储，记录IP请求次数（未来可升级为Redis）
const rateLimit = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 速率限制窗口：1分钟
const RATE_LIMIT_MAX = 100; // 每分钟最大请求数

/**
 * API端点：搜索艺术家数据，支持基于查询字符串和服务平台的过滤。
 * 支持的查询参数：
 * - query: 搜索关键词，匹配艺术家名称（最大长度100字符）
 * - service: 服务平台过滤（最大长度50字符）
 * 未来扩展：
 * - sortBy: 排序字段（publishDate 或 updateDate）
 * - page: 分页页码
 * - limit: 每页记录数
 * 响应格式：
 * - 成功：返回艺术家数据数组
 * - 错误：返回错误对象 { error: string, details?: string }
 */
export const GET: APIRoute = async ({ request, clientAddress }) => {
  try {
    // 速率限制：基于IP地址限制请求频率（简单实现，未来可使用Redis或外部服务）
    const ip = clientAddress || 'unknown';
    const now = Date.now();
    const rateData = rateLimit.get(ip) || { count: 0, timestamp: now };
    if (now - rateData.timestamp < RATE_LIMIT_WINDOW) {
      rateData.count += 1;
      if (rateData.count > RATE_LIMIT_MAX) {
        return new Response(JSON.stringify({ error: 'Too many requests', details: 'Rate limit exceeded' }), {
          status: 429,
          headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
        });
      }
    } else {
      rateData.count = 1;
      rateData.timestamp = now;
    }
    rateLimit.set(ip, rateData);

    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const service = url.searchParams.get('service') || '';

    // 参数验证：限制长度，防止潜在的注入攻击
    if (query.length > 100 || service.length > 50) {
      return new Response(JSON.stringify({ error: 'Invalid query parameters: too long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 基本内容验证：防止特殊字符或潜在的恶意输入
    const invalidChars = /[<>{}|;]/; // 简单的恶意字符检测
    if (invalidChars.test(query) || invalidChars.test(service)) {
      return new Response(JSON.stringify({ error: 'Invalid query parameters: contains invalid characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 缓存键：基于查询参数生成唯一键
    const cacheKey = `search:${query}:${service}`;
    const cachedResult = cache.get(cacheKey);
    const cacheTimestamp = cachedResult?.timestamp || 0;

    // 如果缓存存在且未过期，直接返回缓存结果
    if (cachedResult && Date.now() - cacheTimestamp < CACHE_DURATION) {
      return new Response(JSON.stringify(cachedResult.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    // 获取艺术家数据
    const artists = await getCollection('artists');
    let result = artists;

    // 应用过滤条件
    if (query) {
      result = result.filter(artist => artist.data.name.toLowerCase().includes(query.toLowerCase()));
    }
    if (service) {
      result = result.filter(artist => artist.data.service === service);
    }

    // 存储结果到缓存
    // 注意：内存缓存适用于低并发场景，高并发下可升级为Redis或Memcached
    const responseData = { data: result, timestamp: Date.now() };
    cache.set(cacheKey, responseData);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('Error in search API:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch artists', details: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};