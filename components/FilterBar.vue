<script setup>
/**
 * @description 筛选条：集合筛选 chips（可横向滚动）与排序方式下拉（antdv-next Dropdown）。
 */
import { computed } from "vue";
import { Dropdown, Menu, MenuItem } from "antdv-next";
import { ArrowUpDown, Check } from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";

const { state, config, categoryCounts } = useHomeport();

/** 排序方式文案映射 */
const sortLabels = { manual: "手动排序", name: "名称顺序", recent: "最近使用" };

/** 「全部」加上配置中的集合，统一渲染为一排 chips */
const chips = computed(() => [
  { key: "all", label: "全部", count: config.sites.length, color: null },
  ...config.categories.map((category) => ({
    key: category.name,
    label: category.name,
    count: categoryCounts.value[category.name] || 0,
    color: category.color
  }))
]);

/**
 * @description 选择排序方式。
 * @param {{key: string}} info - Menu 点击事件信息，key 为排序标识
 * @returns {void}
 */
function onSortSelect(info) {
  state.sort = info.key;
}
</script>

<template>
  <section class="filter-bar" aria-label="分类筛选">
    <div class="filter-scroll">
      <button
        v-for="chip in chips"
        :key="chip.key"
        class="filter-chip"
        :class="{ 'is-active': state.activeCategory === chip.key }"
        type="button"
        @click="state.activeCategory = chip.key"
      >
        <span v-if="chip.color" class="chip-color-dot" :style="{ '--chip-color': chip.color }"></span>
        <span class="chip-label">{{ chip.label }}</span>
        <span class="chip-count">{{ chip.count }}</span>
      </button>
    </div>

    <Dropdown trigger="click" placement="bottomRight">
      <button class="sort-button" type="button" aria-haspopup="menu">
        <ArrowUpDown :size="15" />
        <span>{{ sortLabels[state.sort] }}</span>
      </button>
      <template #overlay>
        <Menu :selected-keys="[state.sort]" @click="onSortSelect">
          <MenuItem v-for="(label, key) in sortLabels" :key="key">
            <span class="sort-option">
              {{ label }}
              <Check v-if="state.sort === key" :size="14" />
            </span>
          </MenuItem>
        </Menu>
      </template>
    </Dropdown>
  </section>
</template>
