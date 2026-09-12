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

<h1 align="center">Homeport</h1>

<p align="center">
  <strong>A modern, privacy-first personal navigation workstation with multi-user cloud synchronization.</strong>
</p>

<p align="center">
  <b>English</b> •
  <a href="README_ZH.md">简体中文</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Nuxt-3.21-00DC82?style=flat-square&logo=nuxt.js&logoColor=white" alt="Nuxt 3">
  <img src="https://img.shields.io/badge/Vue-3.5-4FC08D?style=flat-square&logo=vue.js&logoColor=white" alt="Vue 3">
  <img src="https://img.shields.io/badge/Storage-Upstash%20Redis-00E699?style=flat-square&logo=redis&logoColor=white" alt="Upstash Redis">
  <img src="https://img.shields.io/badge/Deploy-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel">
  <img src="https://img.shields.io/badge/License-MIT-amber.svg?style=flat-square" alt="License">
</p>

---

## 📖 Overview

**Homeport** is an elegant, full-featured personal navigation workstation designed for productivity enthusiasts, developers, and knowledge workers. 

Built with **Nuxt 3**, **Vue 3**, and **antdv-next**, Homeport pairs local-first offline speed with serverless multi-user cloud synchronization powered by **GitHub OAuth** and **Upstash Redis**. It runs seamlessly across any desktop and mobile browser, requires zero database maintenance, and deploys effortlessly to **Vercel** with zero server costs.

---

## ✨ Key Features

- 👤 **Multi-User Isolated Cloud Workspaces**: Sign in seamlessly via GitHub OAuth (`nuxt-auth-utils`). User bookmarks are strictly isolated by unique user ID in cloud storage.
- ⚡ **Local-First & Offline Resilience**: Instant page loads with zero network latency. Works completely offline via browser `localStorage` when unauthenticated.
- 🗄️ **Dual-Mode Cloud Storage**: Automatically connects to **Upstash for Redis** in production and falls back to Nitro local storage in development mode.
- 📂 **Flexible Spaces & Collections**: Organize websites into dedicated workspaces (e.g., Work, Research, Entertainment, Tools) with customizable accent colors and Lucide icons.
- 🔍 **Real-Time Instant Search**: Fast fuzzy matching across site name, description, domain, category, and tags with keyboard navigation support.
- 🎛️ **Custom Views & Sorting**: Switch between spacious Grid and compact List views. Sort sites manually via drag-and-drop, alphabetically, or by last used time.
- 📦 **Zero Lock-In Portability**: Export your entire setup into portable JSON packages. Merge or replace configurations across machines with one click.
- 🤖 **Serverless Metadata Extraction**: Built-in Nitro API endpoint (`/api/fetch-meta`) parses webpage title and OpenGraph info to speed up bookmark creation.
- 🌓 **Adaptive Amber Theming**: Warm amber aesthetic with system-adaptive dark and light mode toggle.
- 📱 **Responsive Design**: Dedicated desktop sidebar navigation and optimized mobile bottom bar.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Nuxt 3](https://nuxt.com/) (Vue 3, Vite, Nitro Engine) |
| **UI Components** | [antdv-next](https://www.antdv-next.com/) |
| **Icons** | [lucide-vue-next](https://lucide.dev/) |
| **Authentication** | [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils) (Encrypted Session Cookies + GitHub OAuth) |
| **Cloud Database** | [Upstash Redis](https://upstash.com/) (Serverless REST API) |
| **Deployment** | [Vercel](https://vercel.com/) (Zero-Config Build Output API v3) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 18.0.0`
- [pnpm](https://pnpm.io/) `>= 9.0.0` (recommended)

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/CarlOpenLab/homeport.git
cd homeport

# 2. Install dependencies
pnpm install

# 3. Start local development server
pnpm run dev
```

Open `http://localhost:3000` in your browser. In development mode, mock testing accounts are available out-of-the-box without needing GitHub OAuth credentials.

### Production Build

```bash
pnpm run build
pnpm run preview
```

---

## ☁️ Vercel Deployment Guide

Deploying Homeport to Vercel takes less than 3 minutes:

1. **Import Repository**: In your [Vercel Dashboard](https://vercel.com/), click **Add New Project** and select your GitHub repository.
2. **Connect Upstash Redis**:
   - Go to your Vercel Project -> **Storage** -> **Marketplace** -> Select **Upstash for Redis**.
   - Connect it to your project. Vercel automatically injects `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
3. **Configure GitHub OAuth**:
   - Create an OAuth application at [GitHub Developer Settings](https://github.com/settings/applications/new):
     - **Homepage URL**: `https://<your-project>.vercel.app`
     - **Authorization callback URL**: `https://<your-project>.vercel.app/api/auth/github`
   - In Vercel -> Project **Settings** -> **Environment Variables**, add:
     - `NUXT_OAUTH_GITHUB_CLIENT_ID`: Your GitHub Client ID
     - `NUXT_OAUTH_GITHUB_CLIENT_SECRET`: Your GitHub Client Secret
     - `NUXT_SESSION_PASSWORD`: Any random secret string (32+ characters)
4. **Deploy**: Push changes or click **Redeploy** to apply the environment variables.

---

## 🔐 Extending: Adding More Sign-In Providers

Homeport ships with [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils), which bundles around 50 OAuth provider handlers
(Google, Microsoft, Apple, Discord, GitLab, Gitea, Keycloak/Auth0/Okta/Cognito, and more). Adding a provider requires no schema or data
changes: one `server/api/auth/<provider>.get.ts` file, its credentials, and a button.

### Identity Mapping

Every sign-in entry point resolves its internal user ID through `resolveUserId()` in `server/utils/identity.ts`.
The mappings live in cloud KV (Upstash Redis in production, Nitro local storage in development):

| Storage key | Meaning |
| :--- | :--- |
| `homeport:identity:<provider>:<providerId>` | Provider identity → internal user ID |
| `homeport:email:<email>` | Verified email → internal user ID |

Resolution order:

1. Identity already registered → reuse its bound user ID, so switching devices or sign-in methods lands in the same cloud workspace;
2. Identity unknown but carries a provider-verified email that already belongs to a user → merge into that user;
3. Brand-new user → generate `<provider>_<providerId>`, identical to the historical `github_<id>` format — **no migration of existing cloud data**.

> ⚠️ Only pass an email to `resolveUserId()` when the provider has confirmed the address is verified. Passing an unverified email lets
> another account take over an existing workspace.

### Example: Google

```ts
// server/api/auth/google.get.ts
export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user }) {
    const userId = await resolveUserId({
      provider: "google",
      providerId: user.sub,
      verifiedEmail: user.email_verified ? user.email : null
    });

    await setUserSession(event, {
      user: { id: userId, login: user.email, name: user.name, avatar: user.picture }
    });
    return sendRedirect(event, "/");
  }
});
```

1. Create an OAuth client in the Google Cloud Console with `https://<your-domain>/api/auth/google` as the redirect URI;
2. Add `NUXT_OAUTH_GOOGLE_CLIENT_ID` and `NUXT_OAUTH_GOOGLE_CLIENT_SECRET` to your Vercel environment variables — Nitro maps them to
   `runtimeConfig.oauth.google` automatically, so `nuxt.config.ts` needs no change;
3. Add a button in `components/UserMenu.vue` that navigates to `/api/auth/google`.

> Providers without OIDC support (Gitee, WeChat, QQ, DingTalk, Feishu) need their own "redirect to authorize → exchange code in callback" flow,
> but they end with the same `resolveUserId()` plus `setUserSession()` pair, reusing the whole identity-mapping and workspace-isolation path.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
