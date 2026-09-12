import { kvGet, kvSet } from "./kv";

/**
 * @description 获取指定用户的云端导航配置。
 * 存储后端由 kv 工具自动选择：生产环境 Upstash Redis / Vercel KV，本地开发降级到 Nitro 内置存储。
 * @param {string} userId - 用户唯一标识
 * @returns {Promise<object|null>} 用户的导航配置对象
 */
export async function getUserConfig(userId: string) {
  if (!userId) return null;

  const data = await kvGet<Record<string, unknown>>(
    `homeport:user:${userId}:config`
  );
  return data || null;
}

/**
 * @description 保存指定用户的云端导航配置。
 * @param {string} userId - 用户唯一标识
 * @param {unknown} data - 用户的导航配置对象
 * @returns {Promise<boolean>} 是否保存成功
 */
export async function setUserConfig(userId: string, data: unknown) {
  if (!userId || !data) return false;

  return kvSet(`homeport:user:${userId}:config`, data);
}
