export default eventHandler(async (event) => {
  const runtime = useRuntimeConfig(event);

  // 动态在每次请求时提取所有可能的 GitHub OAuth 环境变量命名
  const clientId =
    process.env.NUXT_OAUTH_GITHUB_CLIENT_ID ||
    process.env.GITHUB_CLIENT_ID ||
    process.env.NUXT_GITHUB_CLIENT_ID ||
    process.env.GITHUB_ID ||
    runtime.oauth?.github?.clientId;

  const clientSecret =
    process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET ||
    process.env.GITHUB_CLIENT_SECRET ||
    process.env.NUXT_GITHUB_CLIENT_SECRET ||
    process.env.GITHUB_SECRET ||
    runtime.oauth?.github?.clientSecret;

  const handler = defineOAuthGitHubEventHandler({
    config: {
      emailRequired: false,
      ...(clientId ? { clientId: String(clientId).trim() } : {}),
      ...(clientSecret ? { clientSecret: String(clientSecret).trim() } : {})
    },
    async onSuccess(event, { user }) {
      // GitHub 只会把账号已验证的邮箱设为公开邮箱，因此 /user 返回的 email 可安全用于跨登录方式的身份合并
      const userId = await resolveUserId({
        provider: "github",
        providerId: user.id,
        verifiedEmail: user.email
      });

      await setUserSession(event, {
        user: {
          id: userId,
          login: user.login,
          name: user.name || user.login,
          avatar: user.avatar_url
        }
      });
      return sendRedirect(event, "/");
    },
    async onError(event, error) {
      console.error("[Auth] GitHub OAuth error:", error);
      const detail = error.message || error.statusMessage || "oauth_failed";
      return sendRedirect(
        event,
        `/?auth_error=${encodeURIComponent(detail)}`
      );
    }
  });

  return handler(event);
});
