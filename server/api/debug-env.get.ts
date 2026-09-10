export default defineEventHandler(() => {
  // 安全诊断接口：只返回变量是否存在及长度，不泄漏任何密钥明文
  const keys = [
    "NUXT_OAUTH_GITHUB_CLIENT_ID",
    "NUXT_OAUTH_GITHUB_CLIENT_SECRET",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "NUXT_SESSION_PASSWORD",
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN"
  ];

  const status: Record<string, { exists: boolean; length: number }> = {};
  for (const key of keys) {
    const val = process.env[key];
    status[key] = {
      exists: Boolean(val && val.trim().length > 0),
      length: val ? val.trim().length : 0
    };
  }

  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    vercelEnv: process.env.VERCEL_ENV || "unknown",
    status
  };
});
