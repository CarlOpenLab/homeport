# 泊页 · Homeport

跨浏览器、跨设备可迁移的**个人导航工作台**。基于 Nuxt 3 + Vue 3 + [antdv-next](https://www.antdv-next.com/) 实现，数据支持本地 `localStorage` 与 **GitHub OAuth + Upstash Redis 云端多用户隔离同步**，支持零配置无缝部署到 Vercel。

## 功能

- 空间 / 集合管理（新增、重命名、颜色与图标、删除时自动迁移站点）
- 站点增删改、收藏、搜索联想
- 网格 / 列表视图、手动拖拽排序 / 名称 / 最近使用
- 深浅色主题切换
- 多用户独立空间与 GitHub OAuth 一键免密登录（数据物理隔离）
- Upstash for Redis 自动云端同步与双向拉取覆盖
- 配置包导出、复制、合并或覆盖导入、恢复示例内容
- 桌面端侧栏 + 移动端底部导航
- Nitro 服务端接口（`/api/fetch-meta` 网页元数据解析，部署到 Vercel 自动作为 Serverless 函数运行）

## 开发

```bash
pnpm install
pnpm run dev
```

## 构建与预览

```bash
pnpm run build
pnpm run preview
```

## Vercel 部署与环境变量

推送到 GitHub 后，在 Vercel 导入该仓库即可：
- **Framework Preset**: Nuxt.js（Vercel 自动识别）
- **Build Command**: `pnpm run build`
- **Output Directory**: 自动适配 Vercel Build Output API v3

### 环境变量配置 (Vercel Settings -> Environment Variables)
- `NUXT_OAUTH_GITHUB_CLIENT_ID`: GitHub OAuth App Client ID
- `NUXT_OAUTH_GITHUB_CLIENT_SECRET`: GitHub OAuth App Client Secret
- `NUXT_SESSION_PASSWORD`: 会话加密密钥（32 位以上随机字符串）
- `UPSTASH_REDIS_REST_URL` & `TOKEN`: 关联 Upstash for Redis 数据库后自动注入

## 技术栈

- Nuxt 3 + Vue 3
- [antdv-next](https://www.antdv-next.com/)
- lucide-vue-next
- nuxt-auth-utils (GitHub OAuth)
- @upstash/redis (Serverless Storage)
- Nitro (Server Engine)

## 说明

未登录时所有数据保存在浏览器本地，登录后可享受多端实时自动同步。
