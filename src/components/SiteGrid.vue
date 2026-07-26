<script setup>
/**
 * @description 站点列表区：网格 / 列表两种视图、拖拽排序（手动排序时）与空态展示。
 */
import { Button, message } from "antdv-next";
import { SearchX } from "lucide-vue-next";
import { ref } from "vue";
import { useHomeport } from "../composables/useHomeport.js";
import SiteCard from "./SiteCard.vue";

const emit = defineEmits(["edit-site"]);

const { state, filteredSites, reorderSites, clearFilters } = useHomeport();

const draggingId = ref(null);
const dragOverId = ref(null);

/**
 * @description 开始拖拽一张站点卡片（仅手动排序时允许）。
 * @param {DragEvent} event - 拖拽事件
 * @param {object} site - 被拖拽的站点
 * @returns {void}
 */
function onDragStart(event, site) {
  if (state.sort !== "manual") {
    event.preventDefault();
    return;
  }
  draggingId.value = site.id;
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", site.id);
}

/**
 * @description 拖拽经过另一张卡片时标记落点。
 * @param {DragEvent} event - 拖拽事件
 * @param {object} site - 当前经过的站点
 * @returns {void}
 */
function onDragOver(event, site) {
  if (!draggingId.value || site.id === draggingId.value) return;
  event.preventDefault();
  dragOverId.value = site.id;
}

/**
 * @description 放下卡片：调整顺序并提示保存。
 * @param {object} site - 落点站点
 * @returns {void}
 */
function onDrop(site) {
  if (draggingId.value && draggingId.value !== site.id) {
    reorderSites(draggingId.value, site.id);
    message.success("排序已保存");
  }
  onDragEnd();
}

/**
 * @description 清理拖拽状态。
 * @returns {void}
 */
function onDragEnd() {
  draggingId.value = null;
  dragOverId.value = null;
}
</script>

<template>
  <section class="site-section" aria-labelledby="site-section-title">
    <div class="section-heading-row">
      <h2 id="site-section-title">站点</h2>
      <span>{{ filteredSites.length }} 个入口</span>
    </div>

    <TransitionGroup
      v-if="filteredSites.length"
      name="card"
      tag="div"
      class="site-grid"
      :data-view="state.view"
    >
      <SiteCard
        v-for="site in filteredSites"
        :key="site.id"
        :site="site"
        :draggable="state.sort === 'manual'"
        :class="{ 'is-dragging': draggingId === site.id, 'is-drag-over': dragOverId === site.id }"
        @edit="emit('edit-site', site.id)"
        @dragstart="onDragStart($event, site)"
        @dragover="onDragOver($event, site)"
        @drop="onDrop(site)"
        @dragend="onDragEnd"
      />
    </TransitionGroup>

    <div v-else class="empty-state">
      <span class="empty-icon"><SearchX :size="26" /></span>
      <h2>没有匹配的入口</h2>
      <p>换一个关键词，或清除当前筛选。</p>
      <Button @click="clearFilters">清除筛选</Button>
    </div>
  </section>
</template>
