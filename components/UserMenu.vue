<script setup>
/**
 * @description 用户独立空间认证与云端同步菜单组件：
 * 支持 GitHub OAuth 登录、本地开发模拟登录（仅本地可见）、云端配置双向同步与登出。
 */
import { ref, onMounted } from "vue";
import { Button, Modal, Tooltip, Input, message } from "antdv-next";
import {
  User,
  Cloud,
  CloudUpload,
  CloudDownload,
  LogOut,
  Check,
  Info
} from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";

const isDev = import.meta.dev;
const { user, loggedIn, clear, fetch: fetchSession } = useUserSession();
const { syncState, pushToCloud, pullFromCloud } = useHomeport();

const authModalOpen = ref(false);
const userMenuOpen = ref(false);
const devUsername = ref("carl");
const devLoading = ref(false);

onMounted(async () => {
  await fetchSession();
  if (loggedIn.value) {
    // 登录用户静默载入云端配置
    pullFromCloud(true);
  }

  // 检查是否从 GitHub 认证错误返回
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search);
    const authError = urlParams.get("auth_error");
    if (authError) {
      const decoded = decodeURIComponent(authError);
      message.error({
        content: `GitHub 登录失败：${decoded}`,
        duration: 10
      });
      // 抹除 URL 中的报错参数以保持干净
      window.history.replaceState({}, "", window.location.pathname);
    }
  }
});

/**
 * @description 跳转到 GitHub OAuth 授权页面
 */
function handleGitHubLogin() {
  window.location.href = "/api/auth/github";
}

/**
 * @description 本地开发/测试环境下的快速模拟登录
 */
async function handleDevLogin() {
  if (!devUsername.value.trim()) return;
  devLoading.value = true;
  try {
    await $fetch("/api/auth/dev-login", {
      method: "POST",
      body: { username: devUsername.value.trim() }
    });
    await fetchSession();
    authModalOpen.value = false;
    message.success(`已登录为测试用户：${devUsername.value.trim()}`);
    await pullFromCloud(true);
  } catch (error) {
    message.error("登录失败");
  } finally {
    devLoading.value = false;
  }
}

/**
 * @description 退出登录并重置会话
 */
async function handleLogout() {
  try {
    await $fetch("/api/auth/logout", { method: "POST" });
    await clear();
    userMenuOpen.value = false;
    message.info("已退出登录，恢复本地离线模式");
  } catch (error) {
    message.error("退出登录失败");
  }
}
</script>

<template>
  <div class="user-auth-menu">
    <!-- 未登录状态 -->
    <template v-if="!loggedIn">
      <Button class="auth-btn" size="middle" @click="authModalOpen = true">
        <template #icon>
          <User :size="15" />
        </template>
        <span>登录 / 同步</span>
      </Button>
    </template>

    <!-- 已登录状态：展示头像与云端状态 -->
    <template v-else>
      <div class="user-pill" @click="userMenuOpen = true">
        <img
          :src="user.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + user.login"
          alt="Avatar"
          class="user-avatar"
        />
        <span class="user-name">{{ user.name || user.login }}</span>
        <Tooltip :title="syncState.isSyncing ? '正在同步...' : '云端独立空间已就绪'">
          <span class="sync-dot" :class="{ syncing: syncState.isSyncing }"></span>
        </Tooltip>
      </div>
    </template>

    <!-- 登录弹窗 -->
    <Modal
      v-model:open="authModalOpen"
      title="登录多用户独立空间"
      :footer="null"
      :width="420"
      centered
    >
      <div class="auth-modal-content">
        <div class="auth-intro">
          <Cloud :size="36" class="auth-cloud-icon" />
          <p>登录后即可享受<strong>跨设备多端云同步</strong>，拥有完全独立的专属书签空间，不与他人混淆。</p>
        </div>

        <div class="auth-actions">
          <Button
            type="primary"
            block
            size="large"
            class="github-login-btn"
            @click="handleGitHubLogin"
          >
            <template #icon>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 6px;">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </template>
            使用 GitHub 账号一键登录
          </Button>

          <!-- 仅在本地开发环境可见，生产环境彻底隐藏 -->
          <template v-if="isDev">
            <div class="auth-divider">
              <span>仅本地开发环境可见</span>
            </div>

            <div class="dev-login-box">
              <Input
                v-model:value="devUsername"
                placeholder="输入测试用户名，如 carl"
                @press-enter="handleDevLogin"
              />
              <Button :loading="devLoading" @click="handleDevLogin">
                模拟登录
              </Button>
            </div>
          </template>
        </div>
      </div>
    </Modal>

    <!-- 用户管理与同步弹窗 -->
    <Modal
      v-model:open="userMenuOpen"
      title="我的独立空间"
      :footer="null"
      :width="380"
      centered
    >
      <div class="user-panel-content">
        <div class="user-card-header">
          <img
            :src="user?.avatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=' + user?.login"
            alt=""
            class="user-card-avatar"
          />
          <div class="user-card-info">
            <strong>{{ user?.name || user?.login }}</strong>
            <small>ID: {{ user?.id }}</small>
          </div>
        </div>

        <div class="sync-status-box">
          <div class="sync-status-line">
            <span>云端状态</span>
            <strong v-if="syncState.isSyncing" style="color: #d97706;">同步中...</strong>
            <strong v-else style="color: #10b981; display: inline-flex; align-items: center; gap: 4px;">
              <Check :size="14" /> 已连接云端空间
            </strong>
          </div>
          <small v-if="syncState.lastSyncedAt" class="sync-time">
            最后同步：{{ new Date(syncState.lastSyncedAt).toLocaleTimeString() }}
          </small>
        </div>

        <div class="user-panel-actions">
          <Button
            type="primary"
            block
            :loading="syncState.isSyncing"
            @click="pushToCloud"
          >
            <template #icon><CloudUpload :size="15" /></template>
            同步当前修改到云端
          </Button>

          <Button
            block
            :loading="syncState.isSyncing"
            @click="pullFromCloud(false)"
          >
            <template #icon><CloudDownload :size="15" /></template>
            从云端拉取覆盖本地
          </Button>

          <Button block danger type="text" @click="handleLogout">
            <template #icon><LogOut :size="15" /></template>
            退出登录 (恢复本地模式)
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
.user-auth-menu {
  display: flex;
  align-items: center;
}

.auth-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  font-weight: 500;
}

.user-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px 4px 4px;
  background: var(--bg-card, rgba(0, 0, 0, 0.04));
  border: 1px solid var(--border, rgba(0, 0, 0, 0.08));
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.user-pill:hover {
  border-color: var(--color-primary, #d97706);
  background: var(--bg-hover, rgba(0, 0, 0, 0.07));
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  object-fit: cover;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  max-width: 90px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sync-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  display: inline-block;
}

.sync-dot.syncing {
  background: #d97706;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.auth-modal-content {
  padding: 12px 0 6px;
}

.auth-intro {
  text-align: center;
  margin-bottom: 24px;
}

.auth-cloud-icon {
  color: #d97706;
  margin-bottom: 12px;
}

.auth-intro p {
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.github-login-btn {
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-divider {
  display: flex;
  align-items: center;
  text-align: center;
  color: #94a3b8;
  font-size: 12px;
}

.auth-divider::before,
.auth-divider::after {
  content: "";
  flex: 1;
  border-bottom: 1px dashed #cbd5e1;
}

.auth-divider span {
  padding: 0 10px;
}

.dev-login-box {
  display: flex;
  gap: 8px;
}

.user-panel-content {
  padding: 6px 0;
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  background: var(--bg-hover, #f8fafc);
  border-radius: 10px;
  margin-bottom: 16px;
}

.user-card-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  object-fit: cover;
}

.user-card-info {
  display: flex;
  flex-direction: column;
}

.user-card-info strong {
  font-size: 16px;
}

.user-card-info small {
  color: #64748b;
  font-size: 12px;
}

.sync-status-box {
  padding: 12px;
  border: 1px solid var(--border, #e2e8f0);
  border-radius: 8px;
  margin-bottom: 20px;
}

.sync-status-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.sync-time {
  display: block;
  margin-top: 6px;
  color: #94a3b8;
  font-size: 12px;
}

.user-panel-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

@media (max-width: 640px) {
  .user-name,
  .auth-btn span {
    display: none;
  }

  .user-pill {
    padding: 3px 6px 3px 3px;
  }
}
</style>
