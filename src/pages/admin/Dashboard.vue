<script setup>
/**
 * 管理端 · 数据总览
 * 数据来自 mock 静态数据 + data.classes（响应式）
 */
import { computed } from 'vue'
import {
  Users, GraduationCap, School, CalendarDays, Activity, TrendingUp,
} from 'lucide-vue-next'
import { schoolMetrics, gradeDistribution, recentActivities, scoreTrend } from '@/data/mock'
import { useData } from '@/composables/useData'
import Trend from '@/components/ui/Trend.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import '@/styles/admin.css'

const data = useData()

const now = new Date()
const weekday = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][now.getDay()]
const monthDay = `${now.getMonth() + 1}月${now.getDate()}日`

// 指标卡图标/色调映射
const metricIcons = { Users, GraduationCap, School, CalendarDays }
const metricTone = {
  coral: { color: 'var(--coral)', soft: 'var(--coral-soft)' },
  sky: { color: 'var(--sky)', soft: 'var(--sky-soft)' },
  mint: { color: 'var(--mint)', soft: 'var(--mint-soft)' },
  butter: { color: 'var(--butter)', soft: 'var(--butter-soft)' },
}
const activityTone = {
  coral: 'var(--coral)', mint: 'var(--mint)', sky: 'var(--sky)',
  plum: 'var(--plum)', butter: 'var(--butter)',
}
const toneOf = (m) => metricTone[m.tone] ?? metricTone.coral
const iconOf = (m) => metricIcons[m.icon] ?? Users

// 班级均分排行榜 TOP5（响应式 data.classes）
const ranking = computed(() => [
  ...data.classes.map((c) => ({ name: c.name, score: c.avgScore, color: c.color })),
  { name: '计科 2302 班', score: 84.2, color: 'var(--sky)' },
  { name: '软工 2203 班', score: 81.6, color: 'var(--butter)' },
].sort((a, b) => b.score - a.score).slice(0, 5))

const tooltipConf = {
  trigger: 'axis', backgroundColor: '#fff', borderColor: '#ece0d5',
  borderRadius: 14, textStyle: { fontSize: 12, color: '#4a3f38' },
}

// 学情趋势折线图
const trendOption = computed(() => ({
  tooltip: tooltipConf,
  legend: { show: false },
  grid: { left: 4, right: 12, top: 16, bottom: 4, containLabel: true },
  xAxis: {
    type: 'category', boundaryGap: false,
    data: scoreTrend.map((d) => d.exam),
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 11, margin: 14 },
  },
  yAxis: {
    type: 'value', min: 60, max: 100,
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 11 },
    splitLine: { lineStyle: { color: '#ece0d5', type: 'dashed' } },
  },
  series: [
    {
      name: '计科 2201', type: 'line', smooth: true, showSymbol: false, symbolSize: 6,
      data: scoreTrend.map((d) => d['计科2201']),
      lineStyle: { color: '#F2654C', width: 2.6 }, itemStyle: { color: '#F2654C' },
    },
    {
      name: '软工 2202', type: 'line', smooth: true, showSymbol: false, symbolSize: 6,
      data: scoreTrend.map((d) => d['软工2202']),
      lineStyle: { color: '#F4C244', width: 2.6 }, itemStyle: { color: '#F4C244' },
    },
    {
      name: '专业均分', type: 'line', smooth: true, showSymbol: false, symbolSize: 6,
      data: scoreTrend.map((d) => d['专业均分']),
      lineStyle: { color: '#5B8DEF', width: 2.6, type: 'dashed' }, itemStyle: { color: '#5B8DEF' },
    },
  ],
}))

// 各年级学生分布柱状图
const gradeOption = computed(() => ({
  tooltip: { ...tooltipConf, trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { show: false },
  grid: { left: 4, right: 12, top: 16, bottom: 4, containLabel: true },
  xAxis: {
    type: 'category',
    data: gradeDistribution.map((d) => d.grade),
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 12, margin: 12 },
  },
  yAxis: {
    type: 'value',
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 11 },
    splitLine: { lineStyle: { color: '#ece0d5', type: 'dashed' } },
  },
  series: [
    {
      name: '学生', type: 'bar', barGap: '20%', barMaxWidth: 30,
      data: gradeDistribution.map((d) => d.students),
      itemStyle: { color: '#F2654C', borderRadius: [6, 6, 0, 0] },
    },
    {
      name: '教师', type: 'bar', barMaxWidth: 30,
      data: gradeDistribution.map((d) => d.teachers),
      itemStyle: { color: '#3AA58F', borderRadius: [6, 6, 0, 0] },
    },
  ],
}))
</script>

<template>
  <div class="adm-page">
    <!-- 欢迎横幅 -->
    <section class="adm-welcome">
      <div class="adm-welcome__row">
        <div>
          <span class="eyebrow">ADMIN OVERVIEW · 管理总览</span>
          <h1 class="display adm-welcome__title">全校一览，<em>一切尽在掌握</em></h1>
          <p class="adm-welcome__desc">欢迎回来，管理员。今天校园运行平稳，学情数据持续向好。</p>
        </div>
        <div class="adm-welcome__date">
          <strong>{{ monthDay }}</strong>
          <span>{{ now.getFullYear() }} · {{ weekday }}</span>
        </div>
      </div>
    </section>

    <!-- 指标卡 -->
    <div class="adm-metric-grid">
      <article v-for="(m, i) in schoolMetrics" :key="m.label" class="adm-metric">
        <span class="adm-metric__glow" :style="{ background: toneOf(m).soft }" />
        <div class="adm-metric__top">
          <span class="adm-metric__icon" :style="{ background: toneOf(m).soft, color: toneOf(m).color }">
            <component :is="iconOf(m)" :size="22" :stroke-width="2.2" />
          </span>
          <Trend :value="m.change" />
        </div>
        <div class="adm-metric__label">{{ m.label }}</div>
        <div class="adm-metric__value">{{ m.value }}</div>
        <div class="adm-metric__foot"><Activity :size="13" /> 较上月稳步变化</div>
      </article>
    </div>

    <!-- 两张图表 -->
    <div class="adm-chart-grid">
      <section class="adm-panel">
        <div class="adm-panel__head">
          <div>
            <div class="adm-panel__title">全校学情趋势</div>
            <div class="adm-panel__sub">近 8 次考核 · 专业均分对比</div>
          </div>
          <div class="adm-legend">
            <span class="adm-legend__item"><i class="adm-legend__dot" style="background: var(--coral)" />计科 2201</span>
            <span class="adm-legend__item"><i class="adm-legend__dot" style="background: var(--butter)" />软工 2202</span>
            <span class="adm-legend__item"><i class="adm-legend__dot" style="background: var(--sky)" />专业均分</span>
          </div>
        </div>
        <div class="adm-chart">
          <VChart :option="trendOption" height="260px" />
        </div>
      </section>

      <section class="adm-panel">
        <div class="adm-panel__head">
          <div>
            <div class="adm-panel__title">各年级学生分布</div>
            <div class="adm-panel__sub">大一至大四师生人数</div>
          </div>
          <div class="adm-legend">
            <span class="adm-legend__item"><i class="adm-legend__dot" style="background: var(--coral)" />学生</span>
            <span class="adm-legend__item"><i class="adm-legend__dot" style="background: var(--mint)" />教师</span>
          </div>
        </div>
        <div class="adm-chart">
          <VChart :option="gradeOption" height="260px" />
        </div>
      </section>
    </div>

    <!-- 时间轴 + 排行榜 -->
    <div class="adm-bottom-grid">
      <section class="adm-panel">
        <div class="adm-panel__head">
          <div>
            <div class="adm-panel__title">最新动态</div>
            <div class="adm-panel__sub">校园实时事件流</div>
          </div>
          <span class="pill pill--coral"><i />实时</span>
        </div>
        <div class="adm-timeline">
          <div v-for="(a, i) in recentActivities" :key="i" class="adm-timeline__item">
            <span class="adm-timeline__dot" :style="{ background: activityTone[a.tone] ?? 'var(--coral)' }" />
            <div class="adm-timeline__body">
              <div class="adm-timeline__time">{{ a.time }}</div>
              <div class="adm-timeline__text">{{ a.text }}</div>
            </div>
          </div>
        </div>
      </section>

      <section class="adm-panel">
        <div class="adm-panel__head">
          <div>
            <div class="adm-panel__title">班级均分排行榜</div>
            <div class="adm-panel__sub">全校班级学术表现 TOP 5</div>
          </div>
          <TrendingUp :size="20" color="var(--coral)" />
        </div>
        <div class="adm-rank">
          <div v-for="(r, i) in ranking" :key="r.name" class="adm-rank__item">
            <span class="adm-rank__no">{{ i + 1 }}</span>
            <div class="adm-rank__body">
              <div class="adm-rank__top">
                <span class="adm-rank__name">{{ r.name }}</span>
                <span class="adm-rank__score">{{ r.score.toFixed(1) }}</span>
              </div>
              <ProgressBar :value="r.score" :color="r.color" :height="8" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
