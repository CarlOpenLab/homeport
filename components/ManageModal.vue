<script setup>
/**
 * @description 管理空间与集合弹窗：两个标签页，支持新增、重命名、改颜色 / 图标、删除。
 * 删除时站点自动迁移到第一个剩余空间 / 集合，改动即时持久化并随配置包导出。
 */
import { reactive, ref, watch } from "vue";
import { Modal, Tabs, TabPane, Input, Button, Popconfirm, message } from "antdv-next";
import { Plus, Trash2 } from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";
import { palette } from "../data/presets.js";
import ColorSelect from "./ColorSelect.vue";
import IconSelect from "./IconSelect.vue";

const props = defineProps({
  /** @type {boolean} 弹窗是否可见 */
  open: { type: Boolean, default: false },
  /** @type {"spaces"|"categories"} 打开时聚焦的标签页 */
  tab: { type: String, default: "spaces" }
});
const emit = defineEmits(["update:open"]);

const {
  config, spaceCounts, categoryCounts,
  addSpace, updateSpace, removeSpace,
  addCategory, updateCategory, removeCategory
} = useHomeport();

const activeTab = ref(props.tab);

/** 新建空间 / 集合的草稿 */
const draft = reactive({
  spaceLabel: "",
  spaceIcon: "folder",
  spaceColor: palette[7],
  categoryName: "",
  categoryColor: palette[0]
});

watch(
  () => props.open,
  (open) => {
    if (open) activeTab.value = props.tab;
  }
);

/**
 * @description 执行一个可能抛错的 store 操作，失败时用 message 提示。
 * @param {Function} action - 要执行的操作
 * @returns {boolean} 是否执行成功
 */
function run(action) {
  try {
    action();
    return true;
  } catch (error) {
    message.error(error.message);
    return false;
  }
}

/**
 * @description 提交空间名称修改（失焦 / 回车时），空值或未变化则还原。
 * @param {object} space - 空间对象
 * @param {Event} event - 输入框事件
 * @returns {void}
 */
function commitSpaceLabel(space, event) {
  const value = event.target.value.trim();
  if (!value || value === space.label) {
    event.target.value = space.label;
    return;
  }
  if (!run(() => updateSpace(space.key, { label: value }))) event.target.value = space.label;
}

/**
 * @description 提交集合名称修改（失焦 / 回车时），空值或未变化则还原。
 * @param {object} category - 集合对象
 * @param {Event} event - 输入框事件
 * @returns {void}
 */
function commitCategoryName(category, event) {
  const value = event.target.value.trim();
  if (!value || value === category.name) {
    event.target.value = category.name;
    return;
  }
  if (!run(() => updateCategory(category.name, { name: value }))) event.target.value = category.name;
}

/**
 * @description 新建空间并清空草稿。
 * @returns {void}
 */
function onAddSpace() {
  if (run(() => addSpace({ label: draft.spaceLabel, icon: draft.spaceIcon, color: draft.spaceColor }))) {
    draft.spaceLabel = "";
  }
}

/**
 * @description 新建集合并清空草稿。
 * @returns {void}
 */
function onAddCategory() {
  if (run(() => addCategory({ name: draft.categoryName, color: draft.categoryColor }))) {
    draft.categoryName = "";
  }
}
</script>

<template>
  <Modal
    :open="open"
    title="管理空间与集合"
    :footer="null"
    :width="520"
    @cancel="emit('update:open', false)"
  >
    <Tabs v-model:active-key="activeTab">
      <TabPane key="spaces" tab="空间">
        <div class="manage-list">
          <div v-for="space in config.spaces" :key="space.key" class="manage-row">
            <IconSelect :value="space.icon" @update:value="(icon) => updateSpace(space.key, { icon })" />
            <Input
              class="manage-name"
              :value="space.label"
              :maxlength="20"
              @blur="commitSpaceLabel(space, $event)"
              @press-enter="commitSpaceLabel(space, $event)"
            />
            <ColorSelect :value="space.color" @update:value="(color) => updateSpace(space.key, { color })" />
            <Popconfirm
              :title="`删除空间「${space.label}」？`"
              :description="spaceCounts[space.key] ? `${spaceCounts[space.key]} 个站点将移到其他空间。` : '该空间下没有站点。'"
              ok-text="删除"
              cancel-text="取消"
              @confirm="run(() => removeSpace(space.key))"
            >
              <Button danger type="text" size="small" :aria-label="`删除 ${space.label}`">
                <template #icon><Trash2 :size="15" /></template>
              </Button>
            </Popconfirm>
          </div>

          <div class="manage-row manage-add-row">
            <IconSelect v-model:value="draft.spaceIcon" />
            <Input
              v-model:value="draft.spaceLabel"
              class="manage-name"
              placeholder="新空间名称"
              :maxlength="20"
              @press-enter="onAddSpace"
            />
            <ColorSelect v-model:value="draft.spaceColor" />
            <Button type="primary" size="small" aria-label="新建空间" @click="onAddSpace">
              <template #icon><Plus :size="15" /></template>
            </Button>
          </div>
          <p class="manage-hint">空间是侧栏的顶层导航。删除空间时，其中的站点会移到第一个空间。</p>
        </div>
      </TabPane>

      <TabPane key="categories" tab="集合">
        <div class="manage-list">
          <div v-for="category in config.categories" :key="category.name" class="manage-row">
            <ColorSelect :value="category.color" @update:value="(color) => updateCategory(category.name, { color })" />
            <Input
              class="manage-name"
              :value="category.name"
              :maxlength="20"
              @blur="commitCategoryName(category, $event)"
              @press-enter="commitCategoryName(category, $event)"
            />
            <span class="manage-count">{{ categoryCounts[category.name] || 0 }} 个站点</span>
            <Popconfirm
              :title="`删除集合「${category.name}」？`"
              :description="categoryCounts[category.name] ? `${categoryCounts[category.name]} 个站点将移到其他集合。` : '该集合下没有站点。'"
              ok-text="删除"
              cancel-text="取消"
              @confirm="run(() => removeCategory(category.name))"
            >
              <Button danger type="text" size="small" :aria-label="`删除 ${category.name}`">
                <template #icon><Trash2 :size="15" /></template>
              </Button>
            </Popconfirm>
          </div>

          <div class="manage-row manage-add-row">
            <ColorSelect v-model:value="draft.categoryColor" />
            <Input
              v-model:value="draft.categoryName"
              class="manage-name"
              placeholder="新集合名称"
              :maxlength="20"
              @press-enter="onAddCategory"
            />
            <Button type="primary" size="small" aria-label="新建集合" @click="onAddCategory">
              <template #icon><Plus :size="15" /></template>
            </Button>
          </div>
          <p class="manage-hint">集合是跨空间的分类标签。重命名会同步更新所有站点。</p>
        </div>
      </TabPane>
    </Tabs>
  </Modal>
</template>
