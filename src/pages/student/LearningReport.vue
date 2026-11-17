<script setup>
/**
 * 学生端 · 学情报告
 * 迁移自 React student/LearningReport.tsx
 * 能力雷达 / 知识点掌握度柱状 / 进步趋势面积图均为 ECharts option
 */
import { computed } from 'vue'
import { use } from 'echarts/core'
import { RadarComponent } from 'echarts/components'
import {
  AlertCircle, ArrowUpRight, BookOpen, CheckCircle2, Flame,
  Lightbulb, Sparkles, Target, TrendingUp,
} from 'lucide-vue-next'
import { radarData, knowledgePoints, myScores } from '@/data/mock'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Badge from '@/components/ui/Badge.vue'
import Trend from '@/components/ui/Trend.vue'
import ProgressBar from '@/components/ui/ProgressBar.vue'
import VChart from '@/components/ui/VChart.vue'
import '@/styles/student.css'

// VChart 默认未注册雷达坐标系，这里按需补注册（不影响其他页面）
use([RadarComponent])

const suggestions = [
  { icon: Target, tone: 'coral', title: '稳住优势学科', desc: '知识掌握与作业完成表现突出，继续保持每日复盘的节奏。', tag: '保持' },
  { icon: Lightbulb, tone: 'butter', title: '提升课堂参与', desc: '课堂互动得分 74，试着每周主动发言两次，思维会更活跃。', tag: '提升' },
  { icon: Flame, tone: 'mint', title: '加快进步脚步', desc: '进步幅度 68，建议针对薄弱知识点做专题训练，两周见成效。', tag: '突破' },
]

const weakest = computed(() => [...knowledgePoints].sort((a, b) => a.mastery - b.mastery)[0])

const tooltipConf = {
  backgroundColor: '#fff', borderColor: '#ece0d5', borderRadius: 14,
  textStyle: { fontSize: 12 },
}

// 能力雷达图
const radarOption = computed(() => ({
  tooltip: { ...tooltipConf, trigger: 'item' },
  radar: {
    indicator: radarData.map((d) => ({ name: d.subject, max: d.full })),
    radius: '70%', center: ['50%', '52%'],
    axisName: { color: '#6d5e57', fontSize: 12 },
    axisLine: { lineStyle: { color: '#ece0d5' } },
    splitLine: { lineStyle: { color: '#ece0d5' } },
    splitArea: { areaStyle: { color: ['#fffaf5', '#ffffff'] } },
  },
  series: [{
    name: '我的能力', type: 'radar', symbolSize: 5,
    data: [{ value: radarData.map((d) => d.value), name: '我的能力' }],
    lineStyle: { color: '#F2654C', width: 2 },
    itemStyle: { color: '#F2654C' },
    areaStyle: { color: 'rgba(242,101,76,0.28)' },
  }],
}))

// 知识点掌握度柱状图：我的掌握度 vs 班级平均
const masteryOption = computed(() => ({
  tooltip: { ...tooltipConf, trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { show: false },
  grid: { left: 8, right: 8, top: 16, bottom: 4, containLabel: true },
  xAxis: {
    type: 'category', data: knowledgePoints.map((k) => k.name),
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 11, interval: 0 },
  },
  yAxis: {
    type: 'value', min: 0, max: 100,
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 12 },
    splitLine: { lineStyle: { color: '#ece0d5', type: 'dashed' } },
  },
  series: [
    {
      name: '我的掌握度', type: 'bar', barMaxWidth: 18,
      data: knowledgePoints.map((k) => k.mastery),
      itemStyle: { color: '#F2654C', borderRadius: [7, 7, 0, 0] },
    },
    {
      name: '班级平均', type: 'bar', barMaxWidth: 18,
      data: knowledgePoints.map((k) => k.classAvg),
      itemStyle: { color: '#5B8DEF', borderRadius: [7, 7, 0, 0] },
    },
  ],
}))

// 进步趋势面积图（ECharts 中通过 line + areaStyle 实现面积）
const progressOption = computed(() => ({
  tooltip: { ...tooltipConf, trigger: 'axis' },
  legend: { show: false },
  grid: { left: 8, right: 12, top: 16, bottom: 4, containLabel: true },
  xAxis: {
    type: 'category', boundaryGap: false,
    data: myScores.map((d) => d.exam),
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 11 },
  },
  yAxis: {
    type: 'value', min: 60, max: 100,
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 12 },
    splitLine: { lineStyle: { color: '#ece0d5', type: 'dashed' } },
  },
  series: [
    {
      name: '班级均分', type: 'line', smooth: true, symbolSize: 6,
      data: myScores.map((d) => d.classAvg),
      lineStyle: { color: '#5B8DEF', width: 2 }, itemStyle: { color: '#5B8DEF' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(91,141,239,0.22)' }, { offset: 1, color: 'rgba(91,141,239,0.01)' }] } },
    },
    {
      name: '我的分数', type: 'line', smooth: true, symbolSize: 7,
      data: myScores.map((d) => d.score),
      lineStyle: { color: '#F2654C', width: 3 }, itemStyle: { color: '#F2654C' },
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(242,101,76,0.35)' }, { offset: 1, color: 'rgba(242,101,76,0.02)' }] } },
    },
  ],
}))
</script>

<template>
  <div class="stu-page">
    <div>
      <SectionTitle eyebrow="LEARNING REPORT · 学情报告" title="学情报告" desc="看见自己的成长轨迹，也看见下一步的方向">
        <template #action>
          <button class="btn btn-ghost"><Sparkles :size="15" /> 生成报告</button>
        </template>
      </SectionTitle>
    </div>

    <!-- 学情速览 -->
    <section class="stu-report-hero card">
      <div class="stu-report-hero__left">
        <div class="stu-report-hero__badge"><Sparkles :size="15" /> 本周学情速览</div>
        <div class="stu-report-hero__score display">86<small>分</small></div>
        <div class="stu-report-hero__score-label">综合能力指数 · 表现优秀</div>
      </div>
      <div class="stu-report-hero__metrics">
        <div><span>较上周</span><Trend :value="5.2" /></div>
        <div><span>超过班级</span><strong>82%</strong><small> 的同学</small></div>
        <div><span>重点关注</span><em><AlertCircle :size="14" /> {{ weakest.name }}</em></div>
      </div>
    </section>

    <!-- 雷达图 + 学习建议 -->
    <section class="stu-report-grid">
      <div class="card card-pad stu-radar-card">
        <SectionTitle eyebrow="ABILITY RADAR" title="能力雷达" desc="五维能力一目了然" />
        <div class="stu-chart-box stu-chart-box--radar">
          <VChart :option="radarOption" height="300px" />
        </div>
        <div class="stu-radar-note"><Badge tone="coral">亮点</Badge> 作业完成度高达 92%，保持住！</div>
      </div>

      <div class="card card-pad stu-suggest-card">
        <SectionTitle eyebrow="PERSONALIZED TIPS" title="学习建议" desc="为你定制的三条成长建议">
          <template #action>
            <span class="stu-link-btn">全部建议 <ArrowUpRight :size="15" /></span>
          </template>
        </SectionTitle>
        <div class="stu-suggest-list">
          <div v-for="s in suggestions" :key="s.title" class="stu-suggest" :class="`stu-suggest--${s.tone}`">
            <span class="stu-suggest__icon"><component :is="s.icon" :size="20" :stroke-width="2" /></span>
            <div class="stu-suggest__body">
              <div class="stu-suggest__head">
                <strong>{{ s.title }}</strong>
                <Badge :tone="s.tone">{{ s.tag }}</Badge>
              </div>
              <p>{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 知识点掌握度 + 进步趋势 -->
    <section class="stu-report-grid">
      <div class="card card-pad stu-barchart-card">
        <SectionTitle eyebrow="KNOWLEDGE MASTERY" title="知识点掌握度" desc="我的掌握度 vs 班级平均">
          <template #action>
            <span class="stu-head-icon"><BookOpen :size="15" /> {{ knowledgePoints.length }} 个知识点</span>
          </template>
        </SectionTitle>
        <div class="stu-chart-box">
          <VChart :option="masteryOption" height="280px" />
        </div>
        <div class="stu-mastery-foot">
          <CheckCircle2 :size="16" />
          <span>掌握最好：算法复杂度分析 92%</span>
          <div class="stu-mastery-foot__bar"><ProgressBar :value="92" color="var(--mint)" :height="7" /></div>
        </div>
      </div>

      <div class="card card-pad stu-area-card">
        <SectionTitle eyebrow="PROGRESS TREND" title="进步趋势" desc="我的分数稳步上扬">
          <template #action>
            <span class="stu-head-icon stu-head-icon--mint"><TrendingUp :size="15" /> 近 6 次考核</span>
          </template>
        </SectionTitle>
        <div class="stu-chart-box">
          <VChart :option="progressOption" height="280px" />
        </div>
        <div class="stu-area-foot">
          <Trend :value="14" suffix=" 分" /> <span>从 72 分提升至 86 分</span>
        </div>
      </div>
    </section>
  </div>
</template>
