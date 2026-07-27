<script setup>
/**
 * @description 站点新增 / 编辑弹窗：antdv-next Modal + Form。
 * 编辑模式下额外提供删除入口（带 Popconfirm 二次确认）。
 */
import { computed, reactive, ref, watch } from "vue";
import { Modal, Form, FormItem, Input, Select, Button, Popconfirm, Alert, message } from "antdv-next";
import { useHomeport } from "../composables/useHomeport.js";

const props = defineProps({
  /** @type {boolean} 弹窗是否可见 */
  open: { type: Boolean, default: false },
  /** @type {string|null} 编辑的站点 ID；null 为新增 */
  siteId: { type: String, default: null }
});
const emit = defineEmits(["update:open"]);

const { state, config, saveSite, removeSite } = useHomeport();

/** 表单数据模型 */
const form = reactive({
  id: null,
  name: "",
  url: "",
  description: "",
  space: "",
  category: "",
  tags: ""
});
const formError = ref("");

/** 下拉组件不透传 Option 子节点，统一通过 options 属性提供选项。 */
const spaceOptions = computed(() => config.spaces.map((space) => ({
  value: space.key,
  label: space.label
})));
const categoryOptions = computed(() => config.categories.map((category) => ({
  value: category.name,
  label: category.name
})));

watch(
  () => props.open,
  (open) => {
    if (!open) return;
    formError.value = "";
    const site = props.siteId ? config.sites.find((item) => item.id === props.siteId) : null;
    Object.assign(form, {
      id: null,
      name: "",
      url: "",
      description: "",
      space: config.spaces.some((item) => item.key === state.activeSpace) ? state.activeSpace : config.spaces[0].key,
      category: state.activeCategory !== "all" ? state.activeCategory : config.categories[0].name,
      tags: ""
    }, site && {
      id: site.id,
      name: site.name,
      url: site.url,
      description: site.description,
      space: site.space,
      category: site.category,
      tags: (site.tags || []).join(", ")
    });
  }
);

/**
 * @description 提交表单：校验并保存，出错时在弹窗内展示错误信息。
 * @returns {void}
 */
function onSubmit() {
  try {
    saveSite({ ...form });
    message.success(form.id ? "站点已更新" : "站点已添加");
    emit("update:open", false);
  } catch (error) {
    formError.value = error.message || "请检查填写内容。";
  }
}

/**
 * @description 删除当前编辑的站点。
 * @returns {void}
 */
function onDelete() {
  const removed = removeSite(form.id);
  if (removed) message.success(`已删除 ${removed.name}`);
  emit("update:open", false);
}
</script>

<template>
  <Modal
    :open="open"
    :title="form.id ? '编辑站点' : '添加站点'"
    :footer="null"
    :width="480"
    destroy-on-close
    @cancel="emit('update:open', false)"
  >
    <Form layout="vertical" class="site-form" @submit.prevent="onSubmit">
      <FormItem label="站点名称" required>
        <Input v-model:value="form.name" placeholder="例如 GitHub" :maxlength="80" autofocus />
      </FormItem>
      <FormItem label="网址" required>
        <Input v-model:value="form.url" placeholder="https://" inputmode="url" />
      </FormItem>
      <FormItem label="一句描述">
        <Input v-model:value="form.description" placeholder="这个站点用来做什么" :maxlength="180" />
      </FormItem>
      <div class="form-row">
        <FormItem label="空间">
          <Select v-model:value="form.space" :options="spaceOptions" />
        </FormItem>
        <FormItem label="集合">
          <Select v-model:value="form.category" :options="categoryOptions" />
        </FormItem>
      </div>
      <FormItem label="标签">
        <Input v-model:value="form.tags" placeholder="用逗号分隔，最多 6 个" />
      </FormItem>

      <Alert v-if="formError" type="error" :message="formError" show-icon class="form-alert" />

      <div class="modal-actions">
        <Popconfirm
          v-if="form.id"
          title="删除这个站点？"
          ok-text="删除"
          cancel-text="取消"
          @confirm="onDelete"
        >
          <Button danger type="text">删除站点</Button>
        </Popconfirm>
        <span v-else></span>
        <div class="modal-action-group">
          <Button @click="emit('update:open', false)">取消</Button>
          <Button type="primary" html-type="submit">保存站点</Button>
        </div>
      </div>
    </Form>
  </Modal>
</template>
