<script setup>
/**
 * @description 页面标题区：日期眉标、主标题、当前筛选摘要与「导出配置」按钮。
 */
import { computed } from "vue";
import { Button } from "antdv-next";
import { Download } from "lucide-vue-next";
import { useHomeport } from "../composables/useHomeport.js";

const { resultSummary, exportConfig } = useHomeport();

/** 今日日期文案，如「7月26日星期日」 */
const todayLabel = computed(() =>
  new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "long" }).format(new Date())
);
</script>

<template>
  <section class="page-heading" aria-labelledby="page-title">
    <div>
      <p class="eyebrow">{{ todayLabel }}</p>
      <h1 id="page-title">今天，从哪里开始？</h1>
      <p class="heading-note">{{ resultSummary }}</p>
    </div>
    <Button @click="exportConfig">
      <template #icon><Download :size="15" /></template>
      导出配置
    </Button>
  </section>
</template>
