<script setup>
/**
 * 教师端 · 成绩分析（Vue 版）
 * - Hero 指标卡 / 历次考核趋势 / 分数段分布 / 各班均分对比 / 学生成绩明细
 * - 【新增】成绩导入：Excel/CSV 上传 -> 解析 -> 预览 -> 确认导入，更新学生档案分数并持久化
 */
import { ref, computed } from 'vue'
import { useData } from '@/composables/useData'
import {
  Award, TrendingUp, Users, Target, Download, Trophy, BarChart3, Sparkles,
  Upload, FileSpreadsheet, X, Check, AlertTriangle, CheckCircle2, Info, RotateCcw,
} from 'lucide-vue-next'
import { scoreTrend, scoreDistribution, classes } from '@/data/mock'
import { parseScoreFile, matchStudents, downloadTemplate } from '@/utils/scoreImport'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Badge from '@/components/ui/Badge.vue'
import Toast from '@/components/ui/Toast.vue'
import VChart from '@/components/ui/VChart.vue'
import '@/styles/teacher.css'

const data = useData()

// 最高分学员文案（响应式）
const topStudentFoot = computed(() => topStudent.value
  ? `${topStudent.value.name} · ${data.classes.find((c) => c.id === topStudent.value.classId)?.name ?? '—'}`
  : '—')

// 最高分数值（响应式）
const topScore = computed(() => topStudent.value?.avgScore ?? '—')

const heroCards = [
  { label: '班级平均分', unit: '分', icon: Award, bg: 'linear-gradient(135deg,#F2654C,#ff8a5c)', trend: 2.4, foot: '基于当前学生档案', value: computed(() => classAverage.value) },
  { label: '最高分', unit: '分', icon: Trophy, bg: 'linear-gradient(135deg,#F4C244,#ffd66b)', trend: 0, foot: topStudentFoot, value: topScore },
  { label: '及格率', value: '93.8', unit: '%', icon: Target, bg: 'linear-gradient(135deg,#3AA58F,#5cc4ac)', trend: 5.2, foot: '基于当前学生档案' },
]

const distColors = ['#3AA58F', '#5B8DEF', '#F4C244', '#F2654C', '#d9472e']
const classFilter = ref('c1')
const maxCount = Math.max(...scoreDistribution.map((d) => d.count))

// ===== 响应式学生成绩（导入后实时变化）=====
const classStudents = computed(() => data.students.filter((s) => classFilter.value === 'all' || s.classId === classFilter.value))
const sortedStudents = computed(() => [...classStudents.value].sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0)))
const topStudent = computed(() => [...data.students].sort((a, b) => (b.avgScore ?? 0) - (a.avgScore ?? 0))[0])
const classAverage = computed(() => {
  const list = classStudents.value
  if (!list.length) return '0.0'
  return (list.reduce((s, x) => s + (x.avgScore ?? 0), 0) / list.length).toFixed(1)
})

// ===== 成绩导入状态 =====
const importOpen = ref(false)
const dragging = ref(false)
const fileInput = ref(null)
const parsing = ref(false)
const parseError = ref('')
const preview = ref(null) // { records, matched, unmatched, invalid }
const fileName = ref('')
const toast = ref('')

function showToast(msg) {
  toast.value = msg
  window.setTimeout(() => { toast.value = '' }, 2600)
}

function openImport() {
  importOpen.value = true
  parseError.value = ''
  preview.value = null
  fileName.value = ''
}

function closeImport() {
  importOpen.value = false
  preview.value = null
  parseError.value = ''
}

function triggerFile() {
  fileInput.value?.click()
}

function onDrop(e) {
  dragging.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) handleFile(file)
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) handleFile(file)
  e.target.value = '' // 允许重复选同一文件
}

async function handleFile(file) {
  parsing.value = true
  parseError.value = ''
  preview.value = null
  fileName.value = file.name
  try {
    const parsed = await parseScoreFile(file)
    const result = matchStudents(parsed, data.students, data.classes)
    if (result.records.length === 0) {
      throw new Error('没有解析到有效的数据行')
    }
    preview.value = result
  } catch (err) {
    parseError.value = err instanceof Error ? err.message : '文件解析失败'
  } finally {
    parsing.value = false
  }
}

function confirmImport() {
  if (!preview.value) return
  const matched = preview.value.records.filter((r) => r.status === 'matched')
  if (!matched.length) return
  // 批量更新学生档案分数与绩点
  matched.forEach((r) => {
    data.updateStudent(r.studentId, { avgScore: r.newScore, gpa: r.gpa, trend: Math.round((r.newScore - (r.oldScore ?? 0)) * 10) / 10 })
  })
  showToast(`已导入 ${matched.length} 条成绩，学生档案已更新`)
  closeImport()
}

// ===== 图表配置 =====
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
      areaStyle: { color: { type: 'linear', x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: 'rgba(242,101,76,0.2)' }, { offset: 1, color: 'rgba(242,101,76,0)' }] } },
      markLine: {
        silent: true, symbol: 'none',
        data: [{ yAxis: 80 }],
        lineStyle: { color: '#d8cdc3', type: 'dashed' },
        label: { formatter: '目标线 80', color: '#a2938a', fontSize: 10, position: 'insideEndTop' },
      },
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

const classCompareOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: '#ece0d5', borderRadius: 14, textStyle: { fontSize: 12 } },
  grid: { left: 8, right: 8, top: 8, bottom: 4, containLabel: true },
  xAxis: {
    type: 'category', data: data.classes.map((c) => c.name),
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 10, interval: 0 },
  },
  yAxis: {
    type: 'value', min: 60, max: 100,
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 11 },
    splitLine: { lineStyle: { color: '#ece0d5', type: 'dashed' } },
  },
  series: [{
    type: 'bar', barWidth: 38,
    data: data.classes.map((c) => ({ value: c.avgScore, itemStyle: { color: c.color, borderRadius: [8, 8, 0, 0] } })),
  }],
}))
</script>

<template>
  <div>
    <SectionTitle
      eyebrow="GRADE ANALYTICS"
      title="成绩分析"
      desc="追踪历次考核表现，透视分数段结构与个体差异，支持 Excel 批量导入成绩。"
    >
      <template #action>
        <div style="display: flex; gap: 10px">
          <button class="btn btn-ghost" @click="downloadTemplate(data.students)"><Download :size="16" /> 导入模板</button>
          <button class="btn btn-primary" @click="openImport"><Upload :size="16" /> 导入成绩</button>
        </div>
      </template>
    </SectionTitle>

    <!-- Hero 指标 -->
    <div class="score-hero-cards">
      <div v-for="(c, i) in heroCards" :key="c.label" class="score-hero-card" :style="{ background: c.bg }">
        <div class="score-hero-card__label" style="display: flex; align-items: center; gap: 8px"><component :is="c.icon" :size="16" />{{ c.label }}</div>
        <div class="score-hero-card__value">
          {{ typeof c.value === 'object' && c.value !== null && 'value' in c.value ? c.value.value : c.value }}<span style="font-size: 1rem; font-family: var(--font-sans)"> {{ c.unit }}</span>
        </div>
        <div class="score-hero-card__foot">
          <template v-if="c.trend !== 0"><TrendingUp :size="13" /> +{{ c.trend }}%</template>
          {{ typeof c.foot === 'object' && c.foot !== null && 'value' in c.foot ? c.foot.value : c.foot }}
        </div>
      </div>
    </div>

    <!-- 趋势图 + 分数段 -->
    <div class="grid-2">
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--coral-soft); color: var(--coral)"><TrendingUp :size="17" /></span>
            历次考核成绩趋势
          </div>
          <div class="legend-dots">
            <span><i style="background: #F2654C" />计科2201</span>
            <span><i style="background: #F4C244" />软工2202</span>
            <span><i style="background: #b8aaa0" />专业均分</span>
          </div>
        </div>
        <VChart :option="trendOption" height="270px" />
      </div>

      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--butter-soft); color: #c9931f"><BarChart3 :size="17" /></span>
            分数段分布
          </div>
          <span class="panel__sub">计科2201班 · 48 人</span>
        </div>
        <div style="padding-top: 8px">
          <div v-for="(d, i) in scoreDistribution" :key="d.range" class="dist-row">
            <div class="dist-row__range">{{ d.range }}</div>
            <div class="dist-row__bar">
              <div class="dist-row__fill" :style="{ width: `${(d.count / maxCount) * 100}%`, background: distColors[i] }">{{ d.count }}</div>
            </div>
            <div class="dist-row__count">{{ d.count }}人</div>
          </div>
        </div>
        <div style="margin-top: 20px; padding: 14px 16px; border-radius: var(--r-md); background: var(--mint-soft); display: flex; gap: 10px; align-items: flex-start">
          <Sparkles :size="18" color="var(--mint-deep)" style="flex-shrink: 0; margin-top: 2px" />
          <div style="font-size: 0.78rem; color: var(--mint-deep); line-height: 1.6">
            <strong>分析洞察：</strong>高分段（80+）共 24 人占比 50%，整体表现良好。导入成绩后，指标与明细将自动刷新。
          </div>
        </div>
      </div>
    </div>

    <!-- 班级对比 + 明细表 -->
    <div class="grid-2-even">
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--sky-soft); color: var(--sky)"><Users :size="17" /></span>
            各班均分对比
          </div>
          <span class="panel__sub">基于学生档案实时计算</span>
        </div>
        <VChart :option="classCompareOption" height="236px" />
      </div>

      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--mint-soft); color: var(--mint)"><Award :size="17" /></span>
            学生成绩明细
          </div>
          <select v-model="classFilter" class="ppt-select" style="padding: 7px 12px; width: 120px; font-size: 0.78rem">
            <option value="all">全部班级</option>
            <option v-for="c in data.classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
        <div style="overflow-x: auto; max-height: 268px; overflow-y: auto">
          <table class="score-table">
            <thead>
              <tr><th>学生</th><th>分数</th><th>绩点</th><th>水平</th></tr>
            </thead>
            <tbody>
              <tr v-for="(s, i) in sortedStudents" :key="s.id">
                <td>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span style="width: 18px; height: 18px; border-radius: 6px; display: grid; place-items: center; font-size: 0.64rem; font-weight: 800" :style="{ background: i < 3 ? 'var(--butter-soft)' : 'var(--paper-2)', color: i < 3 ? '#c9931f' : 'var(--ink-3)' }">{{ i + 1 }}</span>
                    {{ s.name }}
                  </div>
                </td>
                <td>
                  <div class="score-bar-cell">
                    <strong style="font-family: var(--font-display); font-size: 1.05rem; width: 34px">{{ s.avgScore }}</strong>
                    <div class="mini-bar"><i :style="{ width: `${s.avgScore}%`, background: s.avgScore >= 85 ? 'var(--mint)' : s.avgScore >= 70 ? 'var(--sky)' : 'var(--coral)' }" /></div>
                  </div>
                </td>
                <td style="color: var(--ink-2)">{{ s.gpa ?? '—' }}</td>
                <td>
                  <Badge :tone="s.avgScore >= 85 ? 'mint' : s.avgScore >= 70 ? 'sky' : 'coral'">
                    {{ s.avgScore >= 85 ? '优秀' : s.avgScore >= 70 ? '良好' : '待提升' }}
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="sortedStudents.length === 0" style="text-align: center; padding: 32px; color: var(--ink-3); font-size: 0.84rem">该班级暂无学生，可先到「学生学情」添加。</div>
        </div>
      </div>
    </div>

    <!-- ===== 导入成绩弹窗 ===== -->
    <Transition name="modal">
      <div v-if="importOpen" class="crud-overlay" @click.self="closeImport">
        <div class="crud-modal import-modal" role="dialog" aria-modal="true">
          <div class="crud-modal__head">
            <div>
              <h2 class="crud-modal__title">导入成绩</h2>
              <div class="crud-modal__sub">上传 Excel / CSV，按学号或姓名匹配学生，确认后更新学生档案</div>
            </div>
            <button class="crud-modal__close" @click="closeImport" aria-label="关闭"><X :size="18" /></button>
          </div>

          <div class="crud-modal__body">
            <!-- 上传区 -->
            <div
              class="import-dropzone"
              :class="{ 'import-dropzone--active': dragging }"
              @dragover.prevent="dragging = true"
              @dragleave.prevent="dragging = false"
              @drop.prevent="onDrop"
              @click="triggerFile"
            >
              <input ref="fileInput" type="file" accept=".xlsx,.xls,.csv" style="display: none" @change="onFileChange" />
              <FileSpreadsheet :size="38" class="import-dropzone__icon" />
              <div class="import-dropzone__title">点击选择文件，或拖拽到此处</div>
              <div class="import-dropzone__hint">支持 .xlsx / .xls / .csv · 需包含「学号或姓名」与「成绩」列</div>
              <button class="btn btn-ghost btn-sm" @click.stop="downloadTemplate(data.students)"><Download :size="14" /> 下载模板</button>
            </div>

            <!-- 文件解析中 -->
            <div v-if="parsing" class="import-status">
              <div class="import-spinner" />正在解析文件…
            </div>

            <!-- 解析错误 -->
            <div v-if="parseError" class="import-alert import-alert--error">
              <AlertTriangle :size="18" />{{ parseError }}
            </div>

            <!-- 预览结果 -->
            <template v-if="preview">
              <div class="import-summary">
                <div class="import-summary__item import-summary__item--ok"><CheckCircle2 :size="16" />匹配成功 <b>{{ preview.matched }}</b></div>
                <div class="import-summary__item import-summary__item--warn"><AlertTriangle :size="16" />未匹配 <b>{{ preview.unmatched }}</b></div>
                <div class="import-summary__item import-summary__item--err"><X :size="16" />无效 <b>{{ preview.invalid }}</b></div>
              </div>
              <div class="import-hint"><Info :size="14" />文件「{{ fileName }}」已解析，以下为导入预览。仅「匹配成功」的记录会被导入。</div>
              <div class="import-preview">
                <table class="import-table">
                  <thead><tr><th>行</th><th>学号/姓名</th><th>成绩</th><th>匹配结果</th></tr></thead>
                  <tbody>
                    <tr v-for="r in preview.records" :key="r.row" :class="`import-row--${r.status}`">
                      <td>{{ r.row }}</td>
                      <td>{{ r.studentNo || r.name }}<span v-if="r.matchedName && r.matchedName !== r.name" class="import-match"> → {{ r.matchedName }}</span></td>
                      <td><strong>{{ r.scoreRaw }}</strong><span v-if="r.status === 'matched' && r.oldScore !== undefined" class="import-change">{{ r.oldScore }} → {{ r.newScore }}</span></td>
                      <td>
                        <span v-if="r.status === 'matched'" class="import-badge import-badge--ok"><Check :size="12" /> 可导入</span>
                        <span v-else class="import-badge import-badge--err">{{ r.reason }}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
          </div>

          <div class="crud-modal__foot">
            <button class="btn btn-ghost" @click="closeImport">取消</button>
            <button class="btn btn-primary" :disabled="!preview || preview.matched === 0" @click="confirmImport">
              <Check :size="16" /> 确认导入{{ preview?.matched ? `（${preview.matched} 条）` : '' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Toast v-if="toast" :message="toast" />
  </div>
</template>
