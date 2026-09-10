<script setup>
/**
 * @description 顶栏：移动端菜单按钮、带联想的搜索框、视图切换（antdv-next Segmented）、
 * 主题切换与「添加站点」主按钮。
 */
import { computed, ref } from "vue";
import { Button, Segmented, Tooltip } from "antdv-next";
import { PanelLeft, Search, X, Grid2x2, Rows3, Moon, Sun, Plus, ArrowUpRight } from "lucide-vue-next";
import { useHomeport, getDomain, matchesQuery } from "../composables/useHomeport.js";

const emit = defineEmits(["open-sidebar", "add-site"]);

const { state, config, markSiteUsed } = useHomeport();

const searchFocused = ref(false);
const activeIndex = ref(-1);

/** 搜索联想：与主列表共用 matchesQuery 语义，命中前 5 条 */
const suggestions = computed(() => {
  const query = state.query.trim().toLocaleLowerCase("zh-CN");
  if (!query) return [];
  return config.sites.filter((site) => matchesQuery(site, query)).slice(0, 5);
});

const showSuggestions = computed(() => searchFocused.value && state.query.trim().length > 0);

/** Segmented 视图选项（图标由 label 插槽渲染） */
const viewOptions = [
  { value: "grid", title: "网格视图" },
  { value: "list", title: "列表视图" }
];

/**
 * @description 打开联想结果对应的站点并记录使用时间。
 * @param {object} site - 命中的站点
 * @returns {void}
 */
function openSuggestion(site) {
  markSiteUsed(site.id);
  window.open(site.url, "_blank", "noopener,noreferrer");
  searchFocused.value = false;
  activeIndex.value = -1;
}

/**
 * @description 搜索框键盘操作：上下移动高亮、回车打开、Esc 收起。
 * @param {KeyboardEvent} event - 键盘事件
 * @returns {void}
 */
function onSearchKeydown(event) {
  if (!showSuggestions.value) return;
  const count = suggestions.value.length;
  if (event.key === "ArrowDown" && count) {
    event.preventDefault();
    activeIndex.value = Math.min(count - 1, activeIndex.value + 1);
  } else if (event.key === "ArrowUp" && count) {
    event.preventDefault();
    activeIndex.value = Math.max(0, activeIndex.value - 1);
  } else if (event.key === "Enter" && activeIndex.value >= 0 && suggestions.value[activeIndex.value]) {
    event.preventDefault();
    openSuggestion(suggestions.value[activeIndex.value]);
  } else if (event.key === "Escape") {
    searchFocused.value = false;
  }
}

/**
 * @description 清空搜索词并重置联想高亮。
 * @returns {void}
 */
function clearQuery() {
  state.query = "";
  activeIndex.value = -1;
}

/**
 * @description 输入框失焦时收起联想面板。
 * 面板内的点击用 mousedown.prevent 保持焦点，因此可以同步收起。
 * @returns {void}
 */
function onSearchBlur() {
  searchFocused.value = false;
  activeIndex.value = -1;
}
</script>

<template>
  <header class="topbar">
    <button class="icon-ghost mobile-menu" type="button" aria-label="打开导航" @click="emit('open-sidebar')">
      <PanelLeft :size="19" />
    </button>

    <div class="search-wrap">
      <Search :size="17" class="search-icon" aria-hidden="true" />
      <label class="sr-only" for="search-input">搜索站点、标签或域名</label>
      <input id="search-input" v-model="state.query" type="search" autocomplete="off" placeholder="搜索站点、标签或域名"
        role="combobox" :aria-expanded="showSuggestions" @focus="searchFocused = true" @blur="onSearchBlur"
        @keydown="onSearchKeydown">
      <button v-if="state.query" class="search-clear" type="button" aria-label="清除搜索" @mousedown.prevent="clearQuery">
        <X :size="15" />
      </button>

      <Transition name="pop">
        <div v-if="showSuggestions" class="search-suggestions" role="listbox">
          <template v-if="suggestions.length">
            <button v-for="(site, index) in suggestions" :key="site.id" class="suggestion-item"
              :class="{ 'is-active': index === activeIndex }" type="button" role="option"
              :aria-selected="index === activeIndex" @mousedown.prevent="openSuggestion(site)"
              @mousemove="activeIndex = index">
              <img :src="site.favicon" width="28" height="28" alt="">
              <span class="suggestion-copy">
                <strong>{{ site.name }}</strong>
                <small>{{ getDomain(site.url) }}</small>
              </span>
              <ArrowUpRight :size="14" class="suggestion-arrow" />
            </button>
          </template>
          <div v-else class="suggestion-item is-empty" role="option" aria-disabled="true">
            <span class="suggestion-copy">
              <strong>没有直接匹配</strong>
              <small>主列表会继续显示筛选结果</small>
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <div class="topbar-actions">
      <!-- 偏好与外观工具组 -->
      <div class="topbar-group">
        <Segmented v-model:value="state.view" :options="viewOptions" class="view-segmented">
          <template #labelRender="option">
            <Tooltip :title="option.title">
              <span class="segment-icon" :aria-label="option.title">
                <Grid2x2 v-if="option.value === 'grid'" :size="16" />
                <Rows3 v-else :size="16" />
              </span>
            </Tooltip>
          </template>
        </Segmented>

        <Tooltip :title="state.theme === 'dark' ? '切换到浅色' : '切换到深色'">
          <button class="icon-ghost theme-toggle" type="button" :aria-label="state.theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'"
            @click="state.theme = state.theme === 'dark' ? 'light' : 'dark'">
            <Sun v-if="state.theme === 'dark'" :size="18" />
            <Moon v-else :size="18" />
          </button>
        </Tooltip>
      </div>

      <div class="topbar-divider" aria-hidden="true"></div>

      <!-- 核心操作：添加站点 -->
      <Button type="primary" class="add-site-button" @click="emit('add-site')">
        <template #icon>
          <Plus :size="16" />
        </template>
        <span class="add-site-label">添加站点</span>
      </Button>

      <div class="topbar-divider" aria-hidden="true"></div>

      <!-- 用户信息与多端同步独立空间：绝对靠右 -->
      <div class="topbar-user">
        <UserMenu />
      </div>
    </div>
  </header>
</template>

<style>
.view-segmented .ant-segmented-item-label {
  display: flex;
}

.view-segmented .ant-segmented-item-label>span {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
