<script setup>
/**
 * @description 配置与迁移抽屉：导出 / 复制配置、按合并或覆盖方式导入 JSON、
 * 以及恢复示例内容（Popconfirm 二次确认）。
 */
import { ref } from "vue";
import { Drawer, Button, RadioGroup, Radio, Popconfirm, Modal, TextArea as Textarea, message } from "antdv-next";
import { Download, Copy, Upload, FileJson2, ClipboardPaste, Cloud, CloudUpload, CloudDownload, User } from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";

defineProps({
  /** @type {boolean} 抽屉是否可见 */
  open: { type: Boolean, default: false }
});
const emit = defineEmits(["update:open"]);

const { user, loggedIn } = useUserSession();
const { config, syncState, pushToCloud, pullFromCloud, exportConfig, copyConfig, importConfig, importConfigFromText, resetToSample } = useHomeport();

const importMode = ref("merge");
const fileInput = ref(null);

/** 粘贴 JSON 导入弹窗状态 */
const pasteOpen = ref(false);
const pasteText = ref("");
/** 弹窗内独立的导入方式，打开时继承抽屉里的 importMode，取消不影响外部 */
const pasteMode = ref("merge");

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
 * @description 打开粘贴 JSON 导入弹窗并清空上次内容。
 * @returns {void}
 */
function openPaste() {
  pasteText.value = "";
  pasteMode.value = importMode.value;
  pasteOpen.value = true;
}

/**
 * @description 提交粘贴的 JSON 文本导入；成功后关闭弹窗，失败时提示并保留内容。
 * @returns {void}
 */
function onPasteImport() {
  const text = pasteText.value.trim();
  if (!text) {
    message.warning("请先粘贴配置 JSON");
    return;
  }
  try {
    importConfigFromText(text, pasteMode.value);
    message.success(pasteMode.value === "replace" ? "配置已覆盖导入" : "配置已合并导入");
    pasteOpen.value = false;
  } catch (error) {
    message.error("无法导入：JSON 格式不正确或缺少 sites 字段");
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

function triggerLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/api/auth/github";
  }
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
            <h3>云端独立空间</h3>
            <p v-if="loggedIn">已登录：<strong>{{ user?.name || user?.login }}</strong></p>
            <p v-else>离线模式（数据仅保存在本机）</p>
          </div>
          <span class="config-badge" :style="{ color: loggedIn ? '#10b981' : '#94a3b8' }">
            <Cloud :size="14" />{{ loggedIn ? '已连接' : '未登录' }}
          </span>
        </div>
        <div class="settings-actions">
          <template v-if="loggedIn">
            <Button type="primary" block :loading="syncState.isSyncing" @click="pushToCloud">
              <template #icon><CloudUpload :size="15" /></template>
              推送到专属云端空间
            </Button>
            <Button block :loading="syncState.isSyncing" @click="pullFromCloud(false)">
              <template #icon><CloudDownload :size="15" /></template>
              从云端拉取覆盖本地
            </Button>
          </template>
          <template v-else>
            <Button type="primary" block @click="triggerLogin">
              <template #icon><User :size="15" /></template>
              使用 GitHub 登录开启同步
            </Button>
          </template>
        </div>
      </section>

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
        <div class="settings-actions">
          <Button block @click="fileInput.click()">
            <template #icon><Upload :size="15" /></template>
            选择 JSON 文件
          </Button>
          <Button block @click="openPaste">
            <template #icon><ClipboardPaste :size="15" /></template>
            粘贴 JSON 导入
          </Button>
        </div>
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

    <Modal
      v-model:open="pasteOpen"
      title="粘贴 JSON 导入"
      ok-text="导入"
      cancel-text="取消"
      :width="560"
      @ok="onPasteImport"
    >
      <RadioGroup v-model:value="pasteMode" class="import-mode">
        <Radio value="merge">
          <span class="radio-copy"><strong>合并</strong><small>保留现有站点，跳过重复网址</small></span>
        </Radio>
        <Radio value="replace">
          <span class="radio-copy"><strong>覆盖</strong><small>用配置包替换当前内容</small></span>
        </Radio>
      </RadioGroup>
      <Textarea
        v-model:value="pasteText"
        :rows="12"
        placeholder='{ "sites": [...], "spaces": [...], "categories": [...] }'
        class="paste-textarea"
      />
    </Modal>
  </Drawer>
</template>
