<p align="center">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="84" height="84">
    <g fill="none" stroke="#d97706" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M 22 72 C 38 84, 62 84, 78 72" />
      <line x1="50" y1="20" x2="50" y2="70" />
      <path d="M 50 32 L 26 44 L 26 62 L 50 50" />
      <path d="M 50 32 L 74 44 L 74 62 L 50 50" />
      <circle cx="50" cy="20" r="2" fill="#d97706" />
    </g>
  </svg>
</p>

<h1 align="center">泊页 · Homeport</h1>

<p align="center">
  <strong>跨浏览器、跨设备、支持多用户云同步的现代化个人导航工作台。</strong>
</p>

<p align="center">
  <a href="README.md">English</a> •
  <b>简体中文</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-3.21-00DC82?style=flat-square&logo=nuxt.js&logoColor=white" alt="Nuxt 3">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Storage-Upstash%20Redis-00E699?style=flat-square&logo=redis&logoColor=white" alt="Upstash Redis">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square" alt="License">
</p>

---

## 📖 项目简介

**泊页 · Homeport** 是一款专为开发者、研究人员与效率追求者打造的现代化个人导航工作台。

项目基于 **Nuxt 3**、**Vue 3** 与 **antdv-next** 构建，结合了本地优先的极致秒开响应与 **GitHub OAuth + Upstash Redis** 驱动的云端多用户隔离同步机制。无需维护任何数据库服务器，即可免费一键部署至 **Vercel**。

---

## ✨ 核心功能

- 👤 **多用户独立云端空间**：支持 GitHub OAuth 一键免密登录，不同用户数据基于 User ID 严格物理隔离，互不干扰。
- ⚡ **本地优先（Local-First）**：未登录时完全使用浏览器 `localStorage`，离线即开即用；登录后支持跨设备双向同步。
- 🗄️ **存储双模无缝适配**：生产环境直连 **Upstash for Redis**，本地开发自动平滑降级至 Nitro 本地持久化存储。
- 📂 **空间与集合管理**：支持自定义空间（工作、摸鱼、开发等）与分类集合，可自由定制色彩与 Lucide 图标。
- 🔍 **即时搜索与智能联想**：支持针对站点名称、描述、网址、分类及标签的毫秒级全文匹配与键盘快捷选择。
- 🎛️ **灵活视图与排序**：支持网格（Grid）与紧凑列表（List）双视图切换；支持鼠标手动拖拽排序、按字母名称或最近使用排序。
- 📦 **配置可迁移（零数据锁定）**：一键导出完整 JSON 备份包，支持在不同电脑间覆盖导入或合并导入，恢复示例内容。
- 🤖 **Serverless 网页元数据提取**：内置 Nitro 服务端接口（`/api/fetch-meta`），输入网址即可自动解析网页标题与 Favicon。
- 🌓 **暖琥珀主题与深浅切换**：精心调优的琥珀色品牌主调，深色模式自适应切换。
- 📱 **多端响应式体验**：桌面端常驻侧边导航，移动端自动切换为轻量底部栏。

---

## 🛠️ 技术架构

| 模块 | 选型与技术 |
| :--- | :--- |
| **全栈框架** | [Nuxt 3](https://nuxt.com/) (Vue 3, Vite, Nitro 引擎) |
| **组件库** | [antdv-next](https://www.antdv-next.com/) |
| **图标库** | [lucide-vue-next](https://lucide.dev/) |
| **用户认证** | [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) (高安全加密 Cookie + GitHub OAuth) |
| **云端存储** | [Upstash Redis](https://upstash.com/) (Serverless REST API) |
| **托管部署** | [Vercel](https://vercel.com/) (零配置适配 Vercel Build Output API v3) |

---

## 🚀 快速开始

### 环境要求
- Node.js `>= 18.0.0`
- [pnpm](https://pnpm.io/) `>= 9.0.0`（推荐）

### 本地开发

```bash
# 1. 克隆代码仓库
git clone https://github.com/CarlOpenLab/homeport.git
cd homeport

# 2. 安装项目依赖
pnpm install

# 3. 启动本地开发服务
pnpm run dev
```

在浏览器打开 `http://localhost:3000`。在本地开发模式下，系统内置了测试用户模拟登录，无需预先注册 GitHub 凭据即可体验多账号切换。

### 生产打包构建

```bash
pnpm run build
pnpm run preview
```

---

## ☁️ Vercel 极速部署指南

1. **导入仓库**：在 [Vercel 控制台](https://vercel.com/) 点击 **Add New Project**，关联并导入 GitHub 仓库。
2. **开通 Upstash for Redis 存储**：
   - 进入项目 -> **Storage** -> 搜索并安装 **Upstash for Redis**，关联到当前项目。
3. **配置 GitHub OAuth 环境变量**：
   - 打开 [GitHub 开发者设置](https://github.com/settings/applications/new) 创建 OAuth App：
     - **Homepage URL**：`https://你的域名.vercel.app`
     - **Authorization callback URL**：`https://你的域名.vercel.app/api/auth/github`
   - 在 Vercel 项目 **Settings -> Environment Variables** 添加：
     - `NUXT_OAUTH_GITHUB_CLIENT_ID`: GitHub Client ID
     - `NUXT_OAUTH_GITHUB_CLIENT_SECRET`: GitHub Client Secret
     - `NUXT_SESSION_PASSWORD`: 任意 32 位以上加密密钥
4. **生效上线**：配置完成后触发一次 **Redeploy** 即可上线！

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。
