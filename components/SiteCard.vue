<script setup>
/**
 * @description 单张站点卡片：favicon、名称链接、收藏与编辑操作、描述、标签和所属空间。
 * 网格与列表视图共用，由父级 data-view 控制布局。
 */
import { computed, ref } from "vue";
import { Tooltip } from "antdv-next";
import { Star, MoreHorizontal, ArrowUpRight } from "lucide-vue-next";
import { useHomeport, getDomain } from "../composables/useHomeport.js";

const props = defineProps({
  /** @type {object} 站点数据 */
  site: { type: Object, required: true },
  /** @type {boolean} 是否允许拖拽（手动排序时） */
  draggable: { type: Boolean, default: false }
});
const emit = defineEmits(["edit"]);

const { toggleFavorite, markSiteUsed, getSpace } = useHomeport();

const faviconFailed = ref(false);

/** 所属空间元数据（缓存，避免模板里重复查找） */
const space = computed(() => getSpace(props.site.space));

/** 站点域名（缓存，避免每次渲染重新解析 URL） */
const domain = computed(() => getDomain(props.site.url));
</script>

<template>
  <article
    class="site-card"
    :draggable="draggable"
    @dragstart="$emit('dragstart', $event)"
    @dragover="$emit('dragover', $event)"
    @drop.prevent="$emit('drop', $event)"
    @dragend="$emit('dragend', $event)"
  >
    <div class="site-card-top">
      <div class="site-identity">
        <img
          v-if="!faviconFailed"
          class="site-favicon"
          :src="site.favicon"
          width="38"
          height="38"
          alt=""
          loading="lazy"
          @error="faviconFailed = true"
        >
        <span v-else class="favicon-fallback" aria-hidden="true">{{ site.name.slice(0, 1).toUpperCase() }}</span>
        <div class="site-title-wrap">
          <a
            class="site-title"
            :href="site.url"
            target="_blank"
            rel="noopener noreferrer"
            @click="markSiteUsed(site.id)"
          >
            {{ site.name }}
            <ArrowUpRight :size="14" class="title-arrow" />
          </a>
          <span class="site-domain">{{ domain }}</span>
        </div>
      </div>
      <div class="card-actions">
        <Tooltip :title="site.favorite ? '取消收藏' : '添加收藏'">
          <button
            class="card-icon-button"
            :class="{ 'is-favorite': site.favorite }"
            type="button"
            :aria-label="site.favorite ? '取消收藏' : '添加收藏'"
            :aria-pressed="site.favorite"
            @click="toggleFavorite(site.id)"
          >
            <Star :size="16" />
          </button>
        </Tooltip>
        <Tooltip title="编辑站点">
          <button class="card-icon-button" type="button" :aria-label="`编辑 ${site.name}`" @click="emit('edit')">
            <MoreHorizontal :size="16" />
          </button>
        </Tooltip>
      </div>
    </div>

    <p class="site-description">{{ site.description || "未添加描述" }}</p>
    <div class="site-card-footer">
      <div class="tag-list">
        <span class="tag">{{ site.category }}</span>
        <span v-for="tag in (site.tags || []).slice(0, 2)" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <span
        class="space-indicator"
        :style="{ '--space-color': space.color }"
      >{{ space.label }}</span>
    </div>
  </article>
</template>
