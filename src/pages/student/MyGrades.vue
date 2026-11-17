<script setup>
/**
 * 学生端 · 我的成绩
 * 迁移自 React student/MyGrades.tsx
 */
import { computed } from 'vue'
import {
  Award, BarChart3, ChevronsDown, ChevronsUp, Minus,
  Target, TrendingUp, Trophy,
} from 'lucide-vue-next'
import { myScores } from '@/data/mock'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Trend from '@/components/ui/Trend.vue'
import Badge from '@/components/ui/Badge.vue'
import VChart from '@/components/ui/VChart.vue'
import '@/styles/student.css'

const avg = computed(() => myScores.reduce((sum, s) => sum + s.score, 0) / myScores.length)
const max = computed(() => Math.max(...myScores.map((s) => s.score)))
const latest = computed(() => myScores[myScores.length - 1])
const avgLead = computed(() =>
  myScores.reduce((sum, s) => sum + (s.score - s.classAvg), 0) / myScores.length,
)

const stats = computed(() => [
  { label: '平均成绩', value: avg.value.toFixed(1), unit: '分', trend: 3.6, icon: Award, tone: 'coral' },
  { label: '最高成绩', value: String(max.value), unit: '分', trend: 6.0, icon: Trophy, tone: 'butter' },
  { label: '当前排名', value: String(latest.value.rank), unit: '/ 48', trend: 3, icon: Target, tone: 'mint' },
  { label: '平均领先均分', value: `+${avgLead.value.toFixed(1)}`, unit: '分', trend: 2.1, icon: TrendingUp, tone: 'sky' },
])

// 成绩 vs 班级均分折线图
const compareOption = computed(() => ({
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

function rankDiff(i) {
  return i === 0 ? null : myScores[i - 1].rank - myScores[i].rank
}
</script>

<template>
  <div class="stu-page">
    <div>
      <SectionTitle eyebrow="MY GRADES · 我的成绩" title="我的成绩" desc="每一次考核，都是成长的刻度">
        <template #action>
          <button class="btn btn-ghost"><BarChart3 :size="15" /> 导出成绩单</button>
        </template>
      </SectionTitle>
    </div>

    <!-- 分数统计卡 -->
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
        <Trend :value="s.trend" suffix=" 较上阶段" :show-icon="false" />
      </div>
    </section>

    <!-- 成绩 vs 班级均分折线图 -->
    <section class="card card-pad stu-chart-card">
      <SectionTitle eyebrow="SCORE COMPARISON" title="成绩 vs 班级均分" desc="我的分数始终走在班级前面">
        <template #action>
          <div class="stu-legend">
            <span><i style="background: var(--coral)" />我的分数</span>
            <span><i style="background: var(--sky)" />班级均分</span>
          </div>
        </template>
      </SectionTitle>
      <div class="stu-chart-box">
        <VChart :option="compareOption" height="320px" />
      </div>
    </section>

    <!-- 成绩明细表格 -->
    <section class="card card-pad stu-table-card">
      <SectionTitle eyebrow="SCORE DETAILS" title="成绩明细" desc="含班级排名与排名变化" />
      <div class="stu-table-wrap">
        <table class="stu-table">
          <thead>
            <tr>
              <th>考核名称</th>
              <th>我的分数</th>
              <th>班级均分</th>
              <th>分差</th>
              <th>班级排名</th>
              <th>排名变化</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(s, i) in myScores"
              :key="s.exam"
              :class="i === myScores.length - 1 ? 'stu-table__row--latest' : ''"
            >
              <td>
                <div class="stu-table__exam">
                  <strong>{{ s.exam }}</strong>
                  <Badge v-if="i === myScores.length - 1" tone="coral">最新</Badge>
                </div>
              </td>
              <td><strong class="stu-table__score">{{ s.score }}</strong></td>
              <td class="muted">{{ s.classAvg }}</td>
              <td>
                <span class="stu-diff" :class="s.score - s.classAvg >= 0 ? 'stu-diff--up' : 'stu-diff--down'">
                  {{ s.score - s.classAvg >= 0 ? '+' : '' }}{{ s.score - s.classAvg }}
                </span>
              </td>
              <td><span class="stu-table__rank">{{ s.rank }}</span> <small class="muted">/ 48</small></td>
              <td>
                <span v-if="rankDiff(i) === null" class="stu-rank-change stu-rank-change--flat"><Minus :size="14" /> 首考</span>
                <span v-else-if="rankDiff(i) > 0" class="stu-rank-change stu-rank-change--up"><ChevronsUp :size="14" /> 上升 {{ rankDiff(i) }}</span>
                <span v-else-if="rankDiff(i) < 0" class="stu-rank-change stu-rank-change--down"><ChevronsDown :size="14" /> 下降 {{ Math.abs(rankDiff(i)) }}</span>
                <span v-else class="stu-rank-change stu-rank-change--flat"><Minus :size="14" /> 持平</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
