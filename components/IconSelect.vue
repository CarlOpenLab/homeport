<script setup>
/**
 * @description 空间图标选择下拉：antdv-next Select 包装，选项与选中态都渲染为 lucide 图标。
 */
import { Select } from "antdv-next";
import { spaceIcons, getSpaceIcon } from "../data/icons.js";

defineProps({
  /** @type {string} 当前图标名 */
  value: { type: String, default: "folder" }
});
const emit = defineEmits(["update:value"]);

/** 图标选项 */
const options = Object.keys(spaceIcons).map((value) => ({ value }));
</script>

<template>
  <Select
    class="manage-icon-select"
    :value="value"
    :options="options"
    @change="(icon) => emit('update:value', icon)"
  >
    <template #labelRender="item">
      <component :is="getSpaceIcon(item.value)" :size="15" class="manage-option-icon" />
    </template>
    <template #optionRender="{ option }">
      <component :is="getSpaceIcon(option.value)" :size="15" class="manage-option-icon" />
    </template>
  </Select>
</template>
