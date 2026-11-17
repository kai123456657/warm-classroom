<script setup>
/**
 * 学生端 · 学习概览
 * 迁移自 React student/Dashboard.tsx
 *  1. 数据来自 mock 静态数据（homeworks / myScores）
 *  2. 图表用 <VChart>，option 为标准 ECharts 配置
 */
import { computed } from 'vue'
import {
  Award, BookOpen, CheckCircle2, ChevronRight, ClipboardList,
  Clock, Flame, Play, Sparkles, TrendingUp, CalendarDays,
} from 'lucide-vue-next'
import { homeworks, myScores } from '@/data/mock'
import Avatar from '@/components/ui/Avatar.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Trend from '@/components/ui/Trend.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import VChart from '@/components/ui/VChart.vue'
import '@/styles/student.css'

const now = new Date()
const greeting = computed(() => {
  const h = now.getHours()
  return h < 11 ? '早上好' : h < 14 ? '中午好' : h < 18 ? '下午好' : '晚上好'
})
const dateText = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
}).format(now)

const stats = [
  { label: '本周学习时长', value: '18.5', unit: '小时', trend: 12.4, icon: Clock, tone: 'coral' },
  { label: '完成作业', value: '23', unit: '份', trend: 8.2, icon: ClipboardList, tone: 'mint' },
  { label: '平均成绩', value: '86.4', unit: '分', trend: 3.2, icon: TrendingUp, tone: 'sky' },
  { label: '班级排名', value: '6', unit: '/ 48', trend: 4, icon: Award, tone: 'butter' },
]

const todayCourses = [
  { time: '08:00', span: '08:00 – 09:30', name: '数据结构 · 线性表与树', teacher: '王明远老师', room: '信息楼 A-301', color: 'var(--coral)', state: 'done' },
  { time: '10:00', span: '10:00 – 11:30', name: '算法设计 · 复杂度分析', teacher: '李静副教授', room: '信息楼 A-305', color: 'var(--sky)', state: 'now' },
  { time: '14:00', span: '14:00 – 15:30', name: '大学英语 · 学术阅读', teacher: '陈思雨老师', room: '外语楼 A-305', color: 'var(--mint)', state: 'next' },
  { time: '16:00', span: '16:00 – 17:30', name: '操作系统 · 进程调度', teacher: '徐立诚教授', room: '信息楼 B-204', color: 'var(--plum)', state: 'next' },
]

const goals = [
  { label: '课堂专注', value: 88, color: 'var(--coral)' },
  { label: '作业完成', value: 92, color: 'var(--mint)' },
  { label: '自主阅读', value: 64, color: 'var(--sky)' },
]

// 待办作业：待完成优先，取前 3 条
const todos = computed(() =>
  [...homeworks]
    .sort((a, b) => (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1))
    .slice(0, 3),
)

// ECharts 配置：我的分数 vs 班级均分折线图
const scoreOption = computed(() => ({
  tooltip: {
    trigger: 'axis', backgroundColor: '#fff', borderColor: '#ece0d5',
    borderRadius: 14, textStyle: { fontSize: 12 },
  },
  legend: { show: false },
  grid: { left: 8, right: 12, top: 16, bottom: 4, containLabel: true },
  xAxis: {
    type: 'category', boundaryGap: false,
    data: myScores.map((d) => d.exam),
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 12 },
  },
  yAxis: {
    type: 'value', min: 60, max: 100,
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 12 },
    splitLine: { lineStyle: { color: '#ece0d5', type: 'dashed' } },
  },
  series: [
    {
      name: '我的分数', type: 'line', smooth: true, symbolSize: 8,
      data: myScores.map((d) => d.score),
      lineStyle: { color: '#F2654C', width: 3 }, itemStyle: { color: '#F2654C' },
    },
    {
      name: '班级均分', type: 'line', smooth: true, symbolSize: 6,
      data: myScores.map((d) => d.classAvg),
      lineStyle: { color: '#5B8DEF', width: 2, type: 'dashed' }, itemStyle: { color: '#5B8DEF' },
    },
  ],
}))
</script>

<template>
  <div class="stu-page">
    <!-- 欢迎横幅 -->
    <section class="stu-welcome">
      <div class="stu-welcome__glow" />
      <div class="stu-welcome__main">
        <div class="eyebrow">STUDENT OVERVIEW · 学习概览</div>
        <h1 class="display stu-welcome__title">
          {{ greeting }}，林知夏 <Sparkles :size="26" class="stu-welcome__spark" />
        </h1>
        <div class="stu-welcome__date">
          <CalendarDays :size="15" /> {{ dateText }}
          <span class="stu-welcome__divider" />
          今天也要元气满满地学习呀
        </div>
        <div class="stu-welcome__chips">
          <span class="stu-welcome__chip"><Flame :size="15" /> 连续学习 <b>12</b> 天</span>
          <span class="stu-welcome__chip stu-welcome__chip--light"><BookOpen :size="15" /> 本周已学 <b>6</b> 门课</span>
        </div>
      </div>
      <div class="stu-welcome__user">
        <Avatar name="林知夏" :size="62" ring />
        <div>
          <strong>林知夏</strong>
          <span>计科2201班 · 学号 202222001</span>
        </div>
      </div>
    </section>

    <!-- 四个数据卡 -->
    <section class="stu-stats">
      <div v-for="s in stats" :key="s.label" class="card stu-stat" :class="`stu-stat--${s.tone}`">
        <div class="stu-stat__top">
          <span class="stu-stat__icon"><component :is="s.icon" :size="19" :stroke-width="2.2" /></span>
          <Trend :value="s.trend" />
        </div>
        <div class="stu-stat__value display">
          {{ s.value }}<small>{{ s.unit }}</small>
        </div>
        <div class="stu-stat__label">{{ s.label }}</div>
        <Trend :value="s.trend" suffix=" 较上周" :show-icon="false" />
      </div>
    </section>

    <!-- 今日课程 + 进度环与待办 -->
    <section class="stu-dash-grid">
      <div class="card card-pad stu-timeline-card">
        <SectionTitle eyebrow="TODAY'S SCHEDULE" title="今日课程" desc="按时间顺序排列，跟着节奏走" />
        <div class="stu-timeline">
          <div v-for="c in todayCourses" :key="c.time" class="stu-timeline__row" :class="`stu-timeline__row--${c.state}`">
            <div class="stu-timeline__rail">
              <span class="stu-timeline__dot" :style="{ color: c.color, borderColor: c.color }">
                <CheckCircle2 v-if="c.state === 'done'" :size="15" />
                <Play v-else-if="c.state === 'now'" :size="13" fill="currentColor" />
                <Clock v-else :size="14" />
              </span>
            </div>
            <div class="stu-timeline__time">
              <strong>{{ c.time }}</strong>
              <span>{{ c.span }}</span>
            </div>
            <div class="stu-timeline__body">
              <strong>{{ c.name }}</strong>
              <span>{{ c.teacher }} · {{ c.room }}</span>
            </div>
            <span class="stu-timeline__tag" :class="`stu-timeline__tag--${c.state}`">
              {{ c.state === 'done' ? '已完成' : c.state === 'now' ? '进行中' : '待上课' }}
            </span>
          </div>
        </div>
      </div>

      <div class="stu-side-col">
        <div class="card card-pad stu-goal-card">
          <SectionTitle eyebrow="DAILY GOAL" title="今日学习目标" />
          <div class="stu-goal-ring-wrap">
            <div class="stu-ring" style="background: conic-gradient(var(--coral) 0 78%, var(--paper-2) 78% 100%)">
              <div class="stu-ring__inner">
                <strong class="display">78%</strong>
                <span>今日完成</span>
              </div>
            </div>
            <div class="stu-goal-list">
              <div v-for="g in goals" :key="g.label" class="stu-goal-line">
                <ProgressBar :value="g.value" :color="g.color" :height="7" show-label />
                <span class="stu-goal-line__name">{{ g.label }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card card-pad stu-todo-card">
          <SectionTitle eyebrow="TO DO" title="待办作业">
            <template #action>
              <button class="stu-link-btn">全部 <ChevronRight :size="15" /></button>
            </template>
          </SectionTitle>
          <div class="stu-todo-list">
            <div v-for="h in todos" :key="h.id" class="stu-todo">
              <span class="stu-todo__bar" :style="{ background: h.color }" />
              <div class="stu-todo__info">
                <strong>{{ h.title }}</strong>
                <span><Clock :size="12" /> 截止 {{ h.dueDate }}</span>
              </div>
              <StatusPill :status="h.status" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 最近成绩折线图 -->
    <section class="card card-pad stu-chart-card">
      <SectionTitle eyebrow="SCORE TREND" title="最近成绩走势" desc="我的分数与班级均分对比">
        <template #action>
          <div class="stu-legend">
            <span><i style="background: var(--coral)" />我的分数</span>
            <span><i style="background: var(--sky)" />班级均分</span>
          </div>
        </template>
      </SectionTitle>
      <div class="stu-chart-box">
        <VChart :option="scoreOption" height="280px" />
      </div>
    </section>
  </div>
</template>
