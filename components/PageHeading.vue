<script setup>
/**
 * @description 页面标题区：动态时段问候、日期眉标、主标题、工作台微指标与「导出配置」按钮。
 */
import { computed } from "vue";
import { Button } from "antdv-next";
import { Download, Sparkles, Star, LayoutGrid } from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";

const { config, state, spaceCounts, exportConfig } = useHomeport();

/** 今日日期文案，如「9月11日 星期五」 */
const todayLabel = computed(() =>
  new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date())
);

/** 时段感应问候语 */
const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return "清晨好，开启新的一天";
  if (hour >= 9 && hour < 12) return "上午好，保持专注与高效";
  if (hour >= 12 && hour < 14) return "午间好，享受片刻从容";
  if (hour >= 14 && hour < 19) return "午后好，灵感在此汇聚";
  if (hour >= 19 && hour < 24) return "夜幕降临，整理与回顾";
  return "夜深了，注意休息";
});

/** 当前激活空间名称 */
const activeSpaceLabel = computed(() => {
  if (state.activeSpace === "all") return "全部空间";
  if (state.activeSpace === "favorites") return "我的收藏";
  const matched = config.spaces.find((s) => s.key === state.activeSpace);
  return matched ? matched.label : "工作空间";
});
</script>

<template>
  <section class="page-heading" aria-labelledby="page-title">
    <div class="heading-main">
      <div class="heading-meta">
        <span class="eyebrow">{{ todayLabel }}</span>
        <span class="meta-divider" aria-hidden="true">·</span>
        <span class="space-badge">
          <Sparkles :size="12" class="sparkle-icon" />
          {{ activeSpaceLabel }}
        </span>
      </div>

      <h1 id="page-title">{{ greeting }}</h1>

      <div class="heading-stats">
        <span class="stat-pill">
          <LayoutGrid :size="13" />
          <span>{{ config.sites.length }} 个收录站点</span>
        </span>
        <span class="stat-pill">
          <Star :size="13" />
          <span>{{ spaceCounts.favorites || 0 }} 个收藏</span>
        </span>
      </div>
    </div>

    <div class="heading-actions">
      <Button class="export-button" @click="exportConfig">
        <template #icon><Download :size="14" /></template>
        导出配置
      </Button>
    </div>
  </section>
</template>
