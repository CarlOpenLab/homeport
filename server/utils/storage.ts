import { kv } from "@vercel/kv";

const IS_VERCEL_KV = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

/**
 * @description 获取指定用户的云端导航配置。
 * 自动识别环境：生产环境有 Vercel KV 时走 KV，本地开发自动降级到 Nitro 内置存储。
 * @param {string} userId - 用户唯一标识
 * @returns {Promise<object|null>} 用户的导航配置对象
 */
export async function getUserConfig(userId: string) {
  if (!userId) return null;

  if (IS_VERCEL_KV) {
    try {
      const data = await kv.get(`homeport:user:${userId}:config`);
      return data || null;
    } catch (error) {
      console.error("[Storage] Vercel KV read error:", error);
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

  if (IS_VERCEL_KV) {
    try {
      await kv.set(`homeport:user:${userId}:config`, data);
      return true;
    } catch (error) {
      console.error("[Storage] Vercel KV write error:", error);
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
