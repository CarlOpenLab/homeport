export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: false
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
