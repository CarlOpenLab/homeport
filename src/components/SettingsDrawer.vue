<script setup>
/**
 * @description 配置与迁移抽屉：导出 / 复制配置、按合并或覆盖方式导入 JSON、
 * 以及恢复示例内容（Popconfirm 二次确认）。
 */
import { ref } from "vue";
import { Drawer, Button, RadioGroup, Radio, Popconfirm, message } from "antdv-next";
import { Download, Copy, Upload, FileJson2 } from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";

defineProps({
  /** @type {boolean} 抽屉是否可见 */
  open: { type: Boolean, default: false }
});
const emit = defineEmits(["update:open"]);

const { config, exportConfig, copyConfig, importConfig, resetToSample } = useHomeport();

const importMode = ref("merge");
const fileInput = ref(null);

/**
 * @description 处理选中的 JSON 文件导入。
 * @param {Event} event - 文件输入 change 事件
 * @returns {Promise<void>} 导入完成的 Promise
 */
async function onFileChange(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  try {
    await importConfig(file, importMode.value);
    message.success(importMode.value === "replace" ? "配置已覆盖导入" : "配置已合并导入");
  } catch (error) {
    message.error("无法导入：文件格式不正确");
  } finally {
    event.target.value = "";
  }
}

/**
 * @description 恢复示例内容并提示。
 * @returns {void}
 */
function onReset() {
  resetToSample();
  message.success("已恢复示例内容");
  emit("update:open", false);
}
</script>

<template>
  <Drawer
    :open="open"
    title="配置与迁移"
    placement="right"
    :width="400"
    @close="emit('update:open', false)"
  >
    <div class="drawer-body">
      <section class="settings-section">
        <div class="settings-title-row">
          <div>
            <h3>配置包</h3>
            <p>包含站点、分类、空间与显示偏好。</p>
          </div>
          <span class="config-badge"><FileJson2 :size="14" />JSON</span>
        </div>
        <dl class="config-stats">
          <div><dt>站点</dt><dd>{{ config.sites.length }}</dd></div>
          <div><dt>空间</dt><dd>{{ config.spaces.length }}</dd></div>
          <div><dt>集合</dt><dd>{{ config.categories.length }}</dd></div>
        </dl>
        <div class="settings-actions">
          <Button type="primary" block @click="exportConfig">
            <template #icon><Download :size="15" /></template>
            导出配置文件
          </Button>
          <Button block @click="copyConfig">
            <template #icon><Copy :size="15" /></template>
            复制配置
          </Button>
        </div>
      </section>

      <section class="settings-section">
        <h3>导入到这台电脑</h3>
        <p>选择另一台电脑导出的配置包。</p>
        <RadioGroup v-model:value="importMode" class="import-mode">
          <Radio value="merge">
            <span class="radio-copy"><strong>合并</strong><small>保留现有站点，跳过重复网址</small></span>
          </Radio>
          <Radio value="replace">
            <span class="radio-copy"><strong>覆盖</strong><small>用配置包替换当前内容</small></span>
          </Radio>
        </RadioGroup>
        <Button block @click="fileInput.click()">
          <template #icon><Upload :size="15" /></template>
          选择 JSON 文件
        </Button>
        <input ref="fileInput" type="file" accept="application/json,.json" hidden @change="onFileChange">
      </section>

      <section class="settings-section danger-zone">
        <div>
          <h3>恢复示例内容</h3>
          <p>清除当前修改并回到初始状态。</p>
        </div>
        <Popconfirm
          title="恢复示例内容？"
          description="当前的站点与设置会被替换。"
          ok-text="确认恢复"
          cancel-text="取消"
          @confirm="onReset"
        >
          <Button danger type="text">恢复</Button>
        </Popconfirm>
      </section>
    </div>
  </Drawer>
</template>
