export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => ({}));
  const username = String(body?.username || "carl").trim() || "carl";
  const userId = `dev_${username.toLowerCase().replace(/[^a-z0-9]/g, "")}`;

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
