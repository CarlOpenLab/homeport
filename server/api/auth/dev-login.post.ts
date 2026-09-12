export default defineEventHandler(async (event) => {
  // 生产环境直接禁用测试模拟登录接口
  if (!import.meta.dev) {
    throw createError({
      statusCode: 403,
      statusMessage: "开发模拟接口仅在本地开发环境生效"
    });
  }

  const body = await readBody(event).catch(() => ({}));
  const username = String(body?.username || "carl").trim() || "carl";
  const userId = await resolveUserId({
    provider: "dev",
    providerId: username.toLowerCase().replace(/[^a-z0-9]/g, "") || "carl"
  });

  await setUserSession(event, {
    user: {
      id: userId,
      login: username,
      name: `${username}`,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`
    }
  });

  return {
    success: true,
    user: {
      id: userId,
      login: username
    }
  };
});
