import { kvGet, kvSet } from "./kv";

/**
 * @description 第三方登录身份描述。
 * providerId 必须是 Provider 内稳定且唯一的用户 ID，禁止使用昵称、邮箱、主页地址等可被用户修改的字段。
 */
export interface AuthIdentity {
  /** Provider 标识（如 github / google / gitee），用于隔离不同平台的同号 ID */
  provider: string;
  /** Provider 返回的稳定用户 ID */
  providerId: string | number;
  /**
   * 已由 Provider 验证归属的邮箱。
   * 仅在 Provider 明确确认邮箱已验证时传入；传入未验证邮箱会导致账号被他人合并。
   */
  verifiedEmail?: string | null;
}

const IDENTITY_PREFIX = "homeport:identity:";
const EMAIL_PREFIX = "homeport:email:";

/**
 * @description 清理用户 ID 中的键分隔符与控制字符，保证存储键安全。
 * @param {string|number} value - 原始标识
 * @returns {string} 可用作存储键的标识
 */
function sanitize(value: string | number): string {
  return String(value).trim().replace(/[^a-zA-Z0-9._-]/g, "");
}

/**
 * @description 将第三方身份解析为 homeport 内部用户 ID。
 * 映射关系持久化在云端 KV，因此新增或更换登录方式时同一用户仍落在同一个云端空间：
 * 1. 身份已登记 -> 复用已绑定的用户 ID；
 * 2. 身份未登记但携带已验证邮箱，且该邮箱已归属某用户 -> 将新身份并入该用户；
 * 3. 全新用户 -> 生成 `${provider}_${providerId}`（与历史 GitHub ID 格式完全一致，存量数据无需迁移）。
 * @param {AuthIdentity} identity - 第三方身份信息
 * @returns {Promise<string>} 内部用户 ID
 */
export async function resolveUserId(identity: AuthIdentity): Promise<string> {
  const provider = sanitize(identity.provider).toLowerCase();
  const providerId = sanitize(identity.providerId);

  if (!provider || !providerId) {
    throw createError({
      statusCode: 500,
      statusMessage: "第三方账号缺少稳定的用户标识，无法建立云端空间"
    });
  }

  const identityKey = `${IDENTITY_PREFIX}${provider}:${providerId}`;
  const email = identity.verifiedEmail?.trim().toLowerCase() || "";
  const emailKey = email ? `${EMAIL_PREFIX}${email}` : "";

  const boundUserId = await kvGet<string>(identityKey);
  if (boundUserId) {
    // 已登记身份：若该身份首次登录时未携带邮箱，此处补齐邮箱索引，
    // 保证之后新增的登录方式仍能通过邮箱并入同一个云端空间
    if (emailKey && !(await kvGet<string>(emailKey))) {
      await kvSet(emailKey, boundUserId);
    }
    return boundUserId;
  }

  if (emailKey) {
    const emailUserId = await kvGet<string>(emailKey);
    if (emailUserId) {
      await kvSet(identityKey, emailUserId);
      return emailUserId;
    }
  }

  const userId = `${provider}_${providerId}`;
  await kvSet(identityKey, userId);
  if (emailKey) await kvSet(emailKey, userId);
  return userId;
}
