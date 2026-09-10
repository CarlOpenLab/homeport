import { getUserConfig } from "../../utils/storage";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user?.id) {
    throw createError({
      statusCode: 401,
      statusMessage: "未登录，无法获取云端配置"
    });
  }

  const config = await getUserConfig(session.user.id);
  return {
    success: true,
    config: config || null
  };
});
