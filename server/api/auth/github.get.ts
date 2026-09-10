export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: false,
    clientId:
      process.env.NUXT_OAUTH_GITHUB_CLIENT_ID ||
      process.env.GITHUB_CLIENT_ID ||
      "",
    clientSecret:
      process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET ||
      process.env.GITHUB_CLIENT_SECRET ||
      ""
  },
  async onSuccess(event, { user }) {
    await setUserSession(event, {
      user: {
        id: `github_${user.id}`,
        login: user.login,
        name: user.name || user.login,
        avatar: user.avatar_url
      }
    });
    return sendRedirect(event, "/");
  },
  async onError(event, error) {
    console.error("[Auth] GitHub OAuth error:", error);
    return sendRedirect(
      event,
      `/?auth_error=${encodeURIComponent(error.message || "oauth_failed")}`
    );
  }
});
