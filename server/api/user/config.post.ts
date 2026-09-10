import { setUserConfig } from "../../utils/storage";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  // 1. 鉴权：未登录直接拦截，不碰存储
  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "未登录，无法保存配置到云端"
    });
  }

  const body = await readBody(event);
  if (!body || typeof body !== "object") {
    throw createError({
      statusCode: 400,
      statusMessage: "非法的配置数据包"
    });
  }

  // 2. 防爆防护：单用户数据包体积限制在 500KB 以内
  const payloadString = JSON.stringify(body);
  if (payloadString.length > 500 * 1024) {
    throw createError({
      statusCode: 413,
      statusMessage: "配置数据包超过 500KB 限制"
    });
  }

  // 3. 基础字段验证与时间戳注入
  body.updatedAt = Date.now();
  body.userId = session.user.id;

  const saved = await setUserConfig(session.user.id, body);
  if (!saved) {
    throw createError({
      statusCode: 500,
      statusMessage: "云端存储写入失败"
    });
  }

  return {
    success: true,
    updatedAt: body.updatedAt
  };
});
