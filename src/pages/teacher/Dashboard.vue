<script setup>
/**
 * 教师端 · 教学概览（Vue 版范例页面）
 * 关键点：
 *  1. useData() 不要解构，用 data.xxx 保持响应式
 *  2. 图表用 <VChart :option="..." />，option 是 ECharts 配置对象
 */
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  CalendarDays, Users, BookOpenCheck, TrendingUp, Sparkles, ChevronRight,
  Presentation, ClipboardCheck, BarChart3, MapPin, Clock, AlertCircle,
  School, GraduationCap, ArrowRight,
} from 'lucide-vue-next'
import { scoreTrend, knowledgePoints } from '@/data/mock'
import { useData } from '@/composables/useData'
import Avatar from '@/components/ui/Avatar.vue'
import Trend from '@/components/ui/Trend.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import '@/styles/teacher.css'

const data = useData()
const router = useRouter()

const today = new Date()
const weekday = ['日', '一', '二', '三', '四', '五', '六'][today.getDay()]
const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日 · 星期${weekday}`

const statCards = [
  { label: '授课班级', value: '4', unit: '个', icon: School, tone: 'coral', trend: 0 },
  { label: '在读学生', value: '181', unit: '人', icon: Users, tone: 'sky', trend: 4 },
  { label: '本周课时', value: '12', unit: '节', icon: BookOpenCheck, tone: 'butter', trend: 0 },
  { label: '平均出勤率', value: '94.6', unit: '%', icon: TrendingUp, tone: 'mint', trend: 2.3 },
]

const todayCourses = [
  { time: '08:00', period: '第 1-2 节', title: '计科2201班 · 数据结构', room: '信息楼 A-301', color: 'var(--coral)', now: false, count: '48人' },
  { time: '10:00', period: '第 3-4 节', title: '数学2101班 · 算法设计', room: '理科楼 B-201', color: 'var(--mint)', now: true, count: '42人' },
  { time: '14:00', period: '第 5-6 节', title: '软工2202班 · 软件工程', room: '信息楼 A-305', color: 'var(--butter)', now: false, count: '45人' },
]

const attentionStudents = computed(() => data.students.filter((s) => s.status === 'warning' || s.status === 'risk').slice(0, 4))

// ECharts 配置：成绩趋势折线 + 面积
const trendOption = computed(() => ({
  tooltip: { trigger: 'axis', backgroundColor: '#fff', borderColor: '#ece0d5', borderRadius: 14, textStyle: { fontSize: 12 } },
  legend: { show: false },
  grid: { left: 8, right: 12, top: 16, bottom: 4, containLabel: true },
  xAxis: {
    type: 'category', boundaryGap: false,
    data: scoreTrend.map((d) => d.exam),
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 11 },
  },
  yAxis: {
    type: 'value', min: 65, max: 95,
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 11 },
    splitLine: { lineStyle: { color: '#ece0d5', type: 'dashed' } },
  },
  series: [
    {
      name: '计科2201', type: 'line', smooth: true, symbolSize: 7,
      data: scoreTrend.map((d) => d['计科2201']),
      lineStyle: { color: '#F2654C', width: 3 }, itemStyle: { color: '#F2654C' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(242,101,76,0.18)' }, { offset: 1, color: 'rgba(242,101,76,0)' }] } },
    },
    {
      name: '软工2202', type: 'line', smooth: true, symbolSize: 6,
      data: scoreTrend.map((d) => d['软工2202']),
      lineStyle: { color: '#F4C244', width: 2.5 }, itemStyle: { color: '#F4C244' },
    },
    {
      name: '专业均分', type: 'line', smooth: true, showSymbol: false,
      data: scoreTrend.map((d) => d['专业均分']),
      lineStyle: { color: '#b8aaa0', width: 2, type: 'dashed' }, itemStyle: { color: '#b8aaa0' },
    },
  ],
}))
</script>

<template>
  <div>
    <!-- 欢迎横幅 -->
    <div class="teacher-hero">
      <div class="teacher-hero__left">
        <div class="teacher-hero__date"><CalendarDays :size="14" />{{ dateStr }}</div>
        <h1 class="teacher-hero__title display">早上好，<em>王明远</em>老师 👋</h1>
        <p class="teacher-hero__sub">新的一天，新的成长。今天有 <strong>3 节课</strong> 等待你，愿你享受每一次传道授业。</p>
        <div class="teacher-hero__actions">
          <button class="btn btn-primary" @click="router.push('/teacher/ppt')">
            <Sparkles :size="17" /> 一键生成课件 <ArrowRight :size="16" />
          </button>
          <button class="btn btn-ghost" @click="router.push('/teacher/analytics')">
            <BarChart3 :size="17" /> 查看学情
          </button>
        </div>
      </div>
      <div class="teacher-hero__right">
        <div class="hero-bubble">
          <div class="hero-bubble__ring" />
          <Sparkles :size="64" :stroke-width="1.4" class="hero-bubble__icon" />
        </div>
        <div class="hero-float-card hero-float-card--1">
          <div class="fi" style="background: var(--mint-soft); color: var(--mint)"><Users :size="17" /></div>
          <div><strong>181</strong><span>在校学生</span></div>
        </div>
        <div class="hero-float-card hero-float-card--2">
          <div class="fi" style="background: var(--butter-soft); color: #c9931f"><ClipboardCheck :size="17" /></div>
          <div><strong>94.6%</strong><span>平均出勤</span></div>
        </div>
      </div>
    </div>

    <!-- 指标卡 -->
    <div class="stat-grid">
      <div v-for="s in statCards" :key="s.label" class="stat-card">
        <div class="stat-card__top">
          <div class="stat-card__icon" :style="{ background: `var(--${s.tone}-soft)`, color: `var(--${s.tone})` }">
            <component :is="s.icon" :size="22" />
          </div>
          <Trend :value="s.trend" />
        </div>
        <div class="stat-card__label">{{ s.label }}</div>
        <div class="stat-card__value">{{ s.value }}<small>{{ s.unit }}</small></div>
        <div class="stat-card__foot">较上周 <Trend :value="s.trend" :show-icon="false" /></div>
      </div>
    </div>

    <!-- 成绩趋势 + 今日课程 -->
    <div class="grid-2">
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--coral-soft); color: var(--coral)"><TrendingUp :size="17" /></span>
            班级成绩趋势
          </div>
          <div class="legend-dots">
            <span><i style="background: #F2654C" />计科2201</span>
            <span><i style="background: #F4C244" />软工2202</span>
            <span><i style="background: #b8aaa0" />专业均分</span>
          </div>
        </div>
        <VChart :option="trendOption" height="248px" />
      </div>

      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--sky-soft); color: var(--sky)"><Clock :size="17" /></span>
            今日课程
          </div>
          <span class="badge badge--coral">3 节</span>
        </div>
        <div>
          <div v-for="(c, i) in todayCourses" :key="i" class="timeline-item" :class="{ 'timeline-item--now': c.now }">
            <div class="timeline-item__time">{{ c.time }}<small>{{ c.period }}</small></div>
            <div class="timeline-item__rail">
              <span class="timeline-item__dot" :style="{ background: c.color }" />
              <span v-if="i < todayCourses.length - 1" class="timeline-item__line" />
            </div>
            <div class="timeline-item__body">
              <div class="timeline-item__title">{{ c.title }}<span v-if="c.now" class="now-tag">进行中</span></div>
              <div class="timeline-item__meta">
                <span><MapPin :size="12" />{{ c.room }}</span><span><Users :size="12" />{{ c.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 关注学生 + 知识点 + 快捷 -->
    <div class="grid-3">
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--butter-soft); color: #c9931f"><AlertCircle :size="17" /></span>
            需要关注
          </div>
          <span class="panel__action" @click="router.push('/teacher/analytics')">全部 <ChevronRight :size="14" /></span>
        </div>
        <div v-for="s in attentionStudents" :key="s.id" class="student-mini-row">
          <Avatar :name="s.name" :size="38" />
          <div class="student-mini-row__info">
            <div class="student-mini-row__name">{{ s.name }}</div>
            <div class="student-mini-row__sub">{{ data.classes.find((c) => c.id === s.classId)?.name }}</div>
          </div>
          <div style="text-align: right"><div class="student-mini-row__score">{{ s.avgScore }}<small>分</small></div></div>
          <StatusPill :status="s.status" />
        </div>
      </div>

      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--mint-soft); color: var(--mint)"><GraduationCap :size="17" /></span>
            知识点掌握
          </div>
          <span class="panel__sub">本班 vs 专业均分</span>
        </div>
        <div v-for="k in knowledgePoints.slice(0, 5)" :key="k.name" style="margin-bottom: 14px">
          <div style="display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 6px">
            <strong>{{ k.name }}</strong>
            <span :style="{ color: k.mastery < k.classAvg ? 'var(--coral)' : 'var(--mint)', fontWeight: 700 }">{{ k.mastery }}%</span>
          </div>
          <ProgressBar :value="k.mastery" :color="k.mastery < k.classAvg ? 'var(--coral)' : 'var(--mint)'" :height="7" />
        </div>
      </div>

      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--plum-soft); color: var(--plum)"><Sparkles :size="17" /></span>
            快捷操作
          </div>
        </div>
        <div class="quick-grid">
          <button class="quick-item" @click="router.push('/teacher/ppt')">
            <span class="quick-item__icon" style="background: var(--coral-soft); color: var(--coral)"><Presentation :size="19" /></span>
            <span class="quick-item__label">生成课件</span><span class="quick-item__desc">AI 智能大纲</span>
          </button>
          <button class="quick-item" @click="router.push('/teacher/grades')">
            <span class="quick-item__icon" style="background: var(--sky-soft); color: var(--sky)"><BarChart3 :size="19" /></span>
            <span class="quick-item__label">成绩分析</span><span class="quick-item__desc">多维对比</span>
          </button>
          <button class="quick-item" @click="router.push('/teacher/schedule')">
            <span class="quick-item__icon" style="background: var(--butter-soft); color: #c9931f"><CalendarDays :size="19" /></span>
            <span class="quick-item__label">调课安排</span><span class="quick-item__desc">本周课表</span>
          </button>
          <button class="quick-item" @click="router.push('/teacher/analytics')">
            <span class="quick-item__icon" style="background: var(--mint-soft); color: var(--mint)"><ClipboardCheck :size="19" /></span>
            <span class="quick-item__label">学情报告</span><span class="quick-item__desc">个性诊断</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
