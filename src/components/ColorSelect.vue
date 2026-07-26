<script setup>
/**
 * @description 颜色选择下拉：antdv-next Select 包装，选项与选中态都渲染为色点。
 * 供空间 / 集合管理复用。
 */
import { Select } from "antdv-next";
import { palette } from "../data/presets.js";

defineProps({
  /** @type {string} 当前颜色 hex */
  value: { type: String, default: "" }
});
const emit = defineEmits(["update:value"]);

/** 色板选项 */
const options = palette.map((value) => ({ value }));
</script>

<template>
  <Select
    class="manage-color-select"
    :value="value"
    :options="options"
    @change="(color) => emit('update:value', color)"
  >
    <template #labelRender="item">
      <span class="color-dot" :style="{ background: item.value }"></span>
    </template>
    <template #optionRender="{ option }">
      <span class="color-dot" :style="{ background: option.value }"></span>
    </template>
  </Select>
</template>
