<script setup>
/**
 * @description 应用根组件：负责 antdv-next 主题配置、整体布局编排，
 * 以及站点编辑弹窗 / 设置抽屉 / 移动端侧栏的开关状态。
 */
import { computed, reactive, watchEffect } from "vue";
import { ConfigProvider, theme } from "antdv-next";

const { state } = useHomeport();

/** URL ?manage=spaces|categories 可在启动时直接打开管理弹窗（便于调试与直达） */
const manageParam = typeof window !== "undefined"
  ? new URLSearchParams(window.location.search).get("manage")
  : null;

/** 弹层与侧栏的界面状态 */
const ui = reactive({
  sidebarOpen: false,
  settingsOpen: false,
  siteModalOpen: false,
  editingSiteId: null,
  manageOpen: manageParam === "spaces" || manageParam === "categories",
  manageTab: manageParam === "categories" ? "categories" : "spaces"
});

/** antdv-next 主题：暖琥珀主色 + Inter 字体，深色模式切换算法 */
const antdTheme = computed(() => ({
  algorithm: state.theme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
  token: {
    colorPrimary: "#d97706",
    colorInfo: "#2563eb",
    colorError: "#dc2626",
    borderRadius: 8,
    fontFamily: "'Inter', 'PingFang SC', 'Microsoft YaHei', system-ui, sans-serif"
  }
}));

watchEffect(() => {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = state.theme;
  }
});

/**
 * @description 打开站点编辑弹窗。
 * @param {string|null} siteId - 要编辑的站点 ID；null 表示新增
 * @returns {void}
 */
function openSiteModal(siteId = null) {
  ui.editingSiteId = siteId;
  ui.siteModalOpen = true;
}

/**
 * @description 打开空间与集合管理弹窗并定位到指定标签页。
 * @param {"spaces"|"categories"} tab - 要聚焦的标签页
 * @returns {void}
 */
function openManage(tab) {
  ui.manageTab = tab;
  ui.manageOpen = true;
  ui.sidebarOpen = false;
}
</script>

<template>
  <ConfigProvider :theme="antdTheme">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <div class="app-shell">
      <Transition name="fade">
        <div v-if="ui.sidebarOpen" class="sidebar-scrim" @click="ui.sidebarOpen = false"></div>
      </Transition>

      <SidebarNav
        :open="ui.sidebarOpen"
        @close="ui.sidebarOpen = false"
        @open-settings="ui.settingsOpen = true"
        @open-manage="openManage"
      />

      <main id="main-content" class="main-area" tabindex="-1">
        <TopBar
          @open-sidebar="ui.sidebarOpen = true"
          @add-site="openSiteModal()"
        />

        <div class="content">
          <PageHeading />
          <FilterBar />
          <SiteGrid @edit-site="openSiteModal" />
        </div>
      </main>

      <MobileNav
        @add-site="openSiteModal()"
        @open-settings="ui.settingsOpen = true"
      />
    </div>

    <SiteFormModal
      v-model:open="ui.siteModalOpen"
      :site-id="ui.editingSiteId"
    />
    <SettingsDrawer v-model:open="ui.settingsOpen" />
    <ManageModal v-model:open="ui.manageOpen" :tab="ui.manageTab" />
  </ConfigProvider>
</template>
