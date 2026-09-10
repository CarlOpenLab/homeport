<script setup>
/**
 * @description 移动端底部导航：全部 / 收藏 / 添加 / 第一个空间 / 配置。
 * 空间槽位跟随配置动态变化。仅在窄屏（CSS 控制）下显示。
 */
import { computed } from "vue";
import { LayoutGrid, Star, PlusCircle, Settings2 } from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";
import { getSpaceIcon } from "../data/icons.js";

const emit = defineEmits(["add-site", "open-settings"]);

const { state, config } = useHomeport();

/** 底部导航展示的第一个空间（配置保证至少一项） */
const firstSpace = computed(() => config.spaces[0]);
</script>

<template>
  <nav class="mobile-nav" aria-label="移动端主要导航">
    <button
      type="button"
      :class="{ 'is-active': state.activeSpace === 'all' }"
      @click="state.activeSpace = 'all'"
    >
      <LayoutGrid :size="19" />
      <span>全部</span>
    </button>
    <button
      type="button"
      :class="{ 'is-active': state.activeSpace === 'favorites' }"
      @click="state.activeSpace = 'favorites'"
    >
      <Star :size="19" />
      <span>收藏</span>
    </button>
    <button type="button" class="mobile-add" @click="emit('add-site')">
      <PlusCircle :size="21" />
      <span>添加</span>
    </button>
    <button
      type="button"
      :class="{ 'is-active': state.activeSpace === firstSpace.key }"
      @click="state.activeSpace = firstSpace.key"
    >
      <component :is="getSpaceIcon(firstSpace.icon)" :size="19" />
      <span>{{ firstSpace.label }}</span>
    </button>
    <button type="button" @click="emit('open-settings')">
      <Settings2 :size="19" />
      <span>配置</span>
    </button>
  </nav>
</template>
