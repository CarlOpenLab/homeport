<script setup>
/**
 * @description 单张站点卡片：favicon、名称链接、收藏与编辑操作、描述、标签和所属空间。
 * 现已升级为整卡响应式触控、悬浮快捷复制链接、微光内托盘与高保真动效。
 */
import { computed, ref } from "vue";
import { Tooltip, message } from "antdv-next";
import { Star, MoreHorizontal, ArrowUpRight, Copy, Check } from "lucide-vue-next";
import { useHomeport, getDomain } from "../composables/useHomeport.js";

const props = defineProps({
  /** @type {object} 站点数据 */
  site: { type: Object, required: true },
  /** @type {boolean} 是否允许拖拽（手动排序时） */
  draggable: { type: Boolean, default: false }
});
const emit = defineEmits(["edit", "dragstart", "dragover", "drop", "dragend"]);

const { toggleFavorite, markSiteUsed, getSpace } = useHomeport();

const faviconFailed = ref(false);
const copied = ref(false);
const cardRef = ref(null);

/** 所属空间元数据（缓存，避免模板里重复查找） */
const space = computed(() => getSpace(props.site.space));

/** 站点域名（缓存，避免每次渲染重新解析 URL） */
const domain = computed(() => getDomain(props.site.url));

/**
 * @description 鼠标移动时实时计算相对卡片的坐标，注入 CSS 变量驱动跟随光斑
 * @param {MouseEvent} event
 */
function onMouseMove(event) {
  if (!cardRef.value) return;
  const rect = cardRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  cardRef.value.style.setProperty("--mouse-x", `${x}px`);
  cardRef.value.style.setProperty("--mouse-y", `${y}px`);
}

/**
 * @description 打开站点并记录使用时间
 */
function openSite() {
  markSiteUsed(props.site.id);
  window.open(props.site.url, "_blank", "noopener,noreferrer");
}

/**
 * @description 卡片主体点击响应：只有在点击非交互元素（不是 button / a 等）时打开网站
 * @param {MouseEvent} event
 */
function onCardClick(event) {
  // 如果点击来自按钮、链接或其内部，不触发整卡跳转
  if (event.target.closest("button") || event.target.closest("a")) {
    return;
  }
  openSite();
}

/**
 * @description 复制站点网址到剪贴板
 */
async function copySiteUrl() {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(props.site.url);
    } else {
      const input = document.createElement("input");
      input.value = props.site.url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    copied.value = true;
    message.success({ content: `已复制链接：${domain.value}`, duration: 2 });
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    message.error("复制失败，请手动选择复制");
  }
}
</script>

<template>
  <article
    ref="cardRef"
    class="site-card"
    :draggable="draggable"
    tabindex="0"
    role="link"
    :aria-label="`${site.name}，网址 ${domain}`"
    @click="onCardClick"
    @mousemove="onMouseMove"
    @keydown.enter="openSite"
    @dragstart="$emit('dragstart', $event)"
    @dragover="$emit('dragover', $event)"
    @drop.prevent="$emit('drop', $event)"
    @dragend="$emit('dragend', $event)"
  >
    <div class="site-card-top">
      <div class="site-identity">
        <div class="site-favicon-wrap">
          <img
            v-if="!faviconFailed"
            class="site-favicon"
            :src="site.favicon"
            width="28"
            height="28"
            alt=""
            loading="lazy"
            @error="faviconFailed = true"
          >
          <span v-else class="favicon-fallback" aria-hidden="true">{{ site.name.slice(0, 1).toUpperCase() }}</span>
        </div>

        <div class="site-title-wrap">
          <a
            class="site-title"
            :href="site.url"
            target="_blank"
            rel="noopener noreferrer"
            @click.stop="markSiteUsed(site.id)"
          >
            <span>{{ site.name }}</span>
            <ArrowUpRight :size="14" class="title-arrow" />
          </a>
          <span class="site-domain">{{ domain }}</span>
        </div>
      </div>

      <div class="card-actions" @click.stop>
        <Tooltip :title="copied ? '已复制！' : '复制网址'">
          <button
            class="card-icon-button is-copy"
            :class="{ 'is-copied': copied }"
            type="button"
            :aria-label="`复制 ${site.name} 的网址`"
            @click="copySiteUrl"
          >
            <Check v-if="copied" :size="15" class="copy-check" />
            <Copy v-else :size="15" />
          </button>
        </Tooltip>

        <Tooltip :title="site.favorite ? '取消收藏' : '添加收藏'">
          <button
            class="card-icon-button"
            :class="{ 'is-favorite': site.favorite }"
            type="button"
            :aria-label="site.favorite ? '取消收藏' : '添加收藏'"
            :aria-pressed="site.favorite"
            @click="toggleFavorite(site.id)"
          >
            <Star :size="15" />
          </button>
        </Tooltip>

        <Tooltip title="编辑站点">
          <button class="card-icon-button" type="button" :aria-label="`编辑 ${site.name}`" @click="emit('edit')">
            <MoreHorizontal :size="15" />
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
