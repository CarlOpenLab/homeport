import { Redis } from "@upstash/redis";

let client: Redis | null | undefined;

/**
 * @description 获取云端 KV 客户端。
 * 生产环境使用 Upstash Redis / Vercel KV（REST 协议，Serverless 友好），
 * 未配置凭据时返回 null，由调用方降级到 Nitro 内置存储。
 * @returns {Redis|null} Redis 客户端实例
 */
function getRedisClient(): Redis | null {
  if (client !== undefined) return client;

  const url =
    process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  client = url && token ? new Redis({ url, token }) : null;
  return client;
}

/**
 * @description 读取云端键值。读取失败不抛错，统一返回 null 以保护登录与同步链路。
 * @param {string} key - 存储键
 * @returns {Promise<T|null>} 键值内容
 */
export async function kvGet<T>(key: string): Promise<T | null> {
  const redis = getRedisClient();

  if (redis) {
    try {
      const data = await redis.get<T>(key);
      return data ?? null;
    } catch (error) {
      console.error("[KV] Upstash Redis read error:", error);
    }
  }

  try {
    const data = await useStorage("data").getItem<T>(key);
    return data ?? null;
  } catch (error) {
    console.error("[KV] Local storage read error:", error);
    return null;
  }
}

/**
 * @description 写入云端键值。
 * @param {string} key - 存储键
 * @param {unknown} value - 待写入内容
 * @returns {Promise<boolean>} 是否写入成功
 */
export async function kvSet(key: string, value: unknown): Promise<boolean> {
  const redis = getRedisClient();

  if (redis) {
    try {
      await redis.set(key, value);
      return true;
    } catch (error) {
      console.error("[KV] Upstash Redis write error:", error);
    }
  }

  try {
    await useStorage("data").setItem(key, value);
    return true;
  } catch (error) {
    console.error("[KV] Local storage write error:", error);
    return false;
  }
}
