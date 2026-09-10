<script setup>
/**
 * @description 侧边栏：品牌区、空间导航（动态，可管理）、集合列表（动态，可管理）、
 * 本机保存状态与设置入口。桌面端常驻，移动端以抽屉形式滑入。
 */
import { computed } from "vue";
import { X, LayoutGrid, Star, RotateCcw, Settings2, ChevronRight, Plus } from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";
import { getSpaceIcon } from "../data/icons.js";

defineProps({
  /** @type {boolean} 移动端抽屉是否展开 */
  open: { type: Boolean, default: false }
});
const emit = defineEmits(["close", "open-settings", "open-manage"]);

const { state, config, spaceCounts, categoryCounts, clearFilters } = useHomeport();

/**
 * 空间导航统一列表：固定的「全部 / 收藏」+ 配置中的动态空间。
 * 这样模板只需一个 v-for。
 */
const spaceNavItems = computed(() => [
  { key: "all", label: "全部站点", icon: LayoutGrid, count: spaceCounts.value.all },
  { key: "favorites", label: "我的收藏", icon: Star, count: spaceCounts.value.favorites },
  ...config.spaces.map((space) => ({
    key: space.key,
    label: space.label,
    icon: getSpaceIcon(space.icon),
    count: spaceCounts.value[space.key] || 0
  }))
]);

/**
 * @description 切换当前空间并收起移动端侧栏。
 * @param {string} key - 空间标识（all/favorites 或空间 key）
 * @returns {void}
 */
function selectSpace(key) {
  state.activeSpace = key;
  emit("close");
}

/**
 * @description 点击品牌区：清空全部筛选回到首页视图。
 * @returns {void}
 */
function goHome() {
  clearFilters();
  emit("close");
}
</script>

<template>
  <aside class="sidebar" :class="{ 'is-open': open }" aria-label="空间与集合导航">
    <div class="brand-row">
      <button class="brand" type="button" aria-label="返回全部站点" @click="goHome">
        <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
        <span class="brand-copy">
          <strong>泊页</strong>
          <small>HOMEPORT</small>
        </span>
      </button>
      <button class="icon-ghost sidebar-close" type="button" aria-label="关闭导航" @click="emit('close')">
        <X :size="18" />
      </button>
    </div>

    <nav class="sidebar-nav" aria-label="主要导航">
      <div class="nav-section-heading">
        <p class="nav-label">空间</p>
        <button class="icon-ghost tiny" type="button" aria-label="管理空间" @click="emit('open-manage', 'spaces')">
          <Plus :size="14" />
        </button>
      </div>
      <button
        v-for="item in spaceNavItems"
        :key="item.key"
        class="nav-item"
        :class="{ 'is-active': state.activeSpace === item.key }"
        type="button"
        @click="selectSpace(item.key)"
      >
        <span class="nav-item-main">
          <component :is="item.icon" :size="17" />
          <span>{{ item.label }}</span>
        </span>
        <span class="nav-count">{{ item.count }}</span>
      </button>
    </nav>

    <nav class="sidebar-nav collection-nav" aria-label="集合">
      <div class="nav-section-heading">
        <p class="nav-label">集合</p>
        <span class="nav-heading-actions">
          <button class="icon-ghost tiny" type="button" aria-label="管理集合" @click="emit('open-manage', 'categories')">
            <Plus :size="14" />
          </button>
          <button class="icon-ghost tiny" type="button" aria-label="清除集合筛选" @click="state.activeCategory = 'all'">
            <RotateCcw :size="14" />
          </button>
        </span>
      </div>
      <button
        v-for="category in config.categories"
        :key="category.name"
        class="nav-item"
        :class="{ 'is-active': state.activeCategory === category.name }"
        type="button"
        @click="state.activeCategory = category.name"
      >
        <span class="nav-item-main">
          <span class="collection-dot" :style="{ '--dot-color': category.color }"></span>
          <span>{{ category.name }}</span>
        </span>
        <span class="nav-count">{{ categoryCounts[category.name] || 0 }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="local-status" aria-live="polite">
        <span class="status-dot" aria-hidden="true"></span>
        <span><strong>已保存在本机</strong><small>自动持久化</small></span>
      </div>
      <button class="nav-item" type="button" @click="emit('open-settings')">
        <span class="nav-item-main">
          <Settings2 :size="17" />
          <span>配置与迁移</span>
        </span>
        <ChevronRight :size="15" class="nav-chevron" />
      </button>
    </div>
  </aside>
</template>
