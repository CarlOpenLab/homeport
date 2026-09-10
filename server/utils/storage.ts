import { createClient } from "@vercel/kv";

const restUrl =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const restToken =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const kv =
  restUrl && restToken ? createClient({ url: restUrl, token: restToken }) : null;

/**
 * @description 获取指定用户的云端导航配置。
 * 自动识别环境：支持 Vercel KV / Upstash Redis 环境变量，本地开发降级到 Nitro 内置存储。
 * @param {string} userId - 用户唯一标识
 * @returns {Promise<object|null>} 用户的导航配置对象
 */
export async function getUserConfig(userId: string) {
  if (!userId) return null;

  if (kv) {
    try {
      const data = await kv.get(`homeport:user:${userId}:config`);
      return data || null;
    } catch (error) {
      console.error("[Storage] KV/Upstash read error:", error);
    }
  }

  // 本地开发或降级存储（Nitro useStorage）
  try {
    const data = await useStorage("data").getItem(`user:${userId}:config`);
    return data || null;
  } catch (error) {
    console.error("[Storage] Local storage read error:", error);
    return null;
  }
}

/**
 * @description 保存指定用户的云端导航配置。
 * @param {string} userId - 用户唯一标识
 * @param {object} data - 用户的导航配置对象
 * @returns {Promise<boolean>} 是否保存成功
 */
export async function setUserConfig(userId: string, data: any) {
  if (!userId || !data) return false;

  if (kv) {
    try {
      await kv.set(`homeport:user:${userId}:config`, data);
      return true;
    } catch (error) {
      console.error("[Storage] KV/Upstash write error:", error);
    }
  }

  // 本地开发或降级存储（Nitro useStorage）
  try {
    await useStorage("data").setItem(`user:${userId}:config`, data);
    return true;
  } catch (error) {
    console.error("[Storage] Local storage write error:", error);
    return false;
  }
}
