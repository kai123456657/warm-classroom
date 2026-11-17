<script setup>
/**
 * 教师端 · 学生学情分析（Vue 版）
 * 对照 React 版 Analytics.tsx 迁移：概览统计 / 能力雷达图 / 知识点柱状图 /
 * 教学建议 / 班级管理 / 学生明细表（搜索·筛选·排序）/ 学生与班级表单 / 删除确认。
 */
import { ref, computed } from 'vue'
import {
  Search, Users, Target, TrendingUp, AlertTriangle, CheckCircle2,
  Activity, Plus, X, Edit2, Trash2, School, Check,
} from 'lucide-vue-next'
import { radarData, knowledgePoints, COLLEGES, MAJORS } from '@/data/mock'
import { useData } from '@/composables/useData'
import Avatar from '@/components/ui/Avatar.vue'
import Trend from '@/components/ui/Trend.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import FormField from '@/components/ui/FormField.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'
import VChart from '@/components/ui/VChart.vue'
import '@/styles/teacher.css'

const data = useData()

const statusFilters = [
  { key: 'all', label: '全部学生' },
  { key: 'excellent', label: '优秀' },
  { key: 'good', label: '良好' },
  { key: 'warning', label: '需关注' },
  { key: 'risk', label: '预警' },
]

const insights = [
  { icon: Target, tone: 'coral', title: '数据结构基础掌握扎实', desc: '班级平均分 88，高于专业均分 9 个百分点，可适度增加探究性题目。' },
  { icon: AlertTriangle, tone: 'butter', title: '计算机网络为薄弱环节', desc: '仅 63% 学生掌握，7 名学生低于及格线，建议安排专项强化训练。' },
  { icon: TrendingUp, tone: 'mint', title: '整体呈上升趋势', desc: '近三次考试均分持续提升，进步学生占比达 62%，学习氛围良好。' },
]

const CLASS_COLORS = ['#F2654C', '#F4C244', '#3AA58F', '#5B8DEF', '#9C6ADE', '#FF9A52']
const GRADES = ['大一', '大二', '大三', '大四']

const emptyStudent = {
  name: '', classId: '', attendance: 100, avgScore: 80, homeworkRate: 90,
  participation: 75, status: 'good', trend: 0,
  studentNo: '', major: '', grade: '', gpa: undefined, credits: undefined,
}
const emptyClass = {
  name: '', subject: '计算机科学与技术', studentCount: 0, avgScore: 80, color: '#F2654C', trend: 0,
  college: '', major: '', grade: '', code: '',
}

const classFilter = ref('all')
const statusFilter = ref('all')
const query = ref('')
const sortKey = ref('avgScore')

const studentModal = ref(false)
const editingStudent = ref(null)
const sForm = ref({ ...emptyStudent })
const classModal = ref(false)
const editingClass = ref(null)
const cForm = ref({ ...emptyClass })
const pendingDelete = ref(null)
const toast = ref('')

function showToast(msg) {
  toast.value = msg
  window.setTimeout(() => { toast.value = '' }, 2200)
}

const num = (v) => Number(v)

const filtered = computed(() => data.students
  .filter((s) => classFilter.value === 'all' || s.classId === classFilter.value)
  .filter((s) => statusFilter.value === 'all' || s.status === statusFilter.value)
  .filter((s) => s.name.includes(query.value.trim()))
  .sort((a, b) => b[sortKey.value] - a[sortKey.value]))

const statusCount = computed(() => ({
  excellent: data.students.filter((s) => s.status === 'excellent').length,
  good: data.students.filter((s) => s.status === 'good').length,
  warning: data.students.filter((s) => s.status === 'warning').length,
  risk: data.students.filter((s) => s.status === 'risk').length,
}))

const statCards = computed(() => [
  { label: '在读学生', value: data.students.length, unit: '人', icon: Users, bg: 'var(--coral-soft)', color: 'var(--coral)', sub: `${data.classes.length} 个教学班` },
  { label: '班级均分', value: '84.1', unit: '分', icon: Activity, bg: 'var(--sky-soft)', color: 'var(--sky)', sub: '较上次 +2.4' },
  { label: '优秀学生', value: statusCount.value.excellent, unit: '人', icon: CheckCircle2, bg: 'var(--mint-soft)', color: 'var(--mint)', sub: `占比 ${data.students.length ? Math.round(statusCount.value.excellent / data.students.length * 100) : 0}%` },
  { label: '需重点关注', value: statusCount.value.warning + statusCount.value.risk, unit: '人', icon: AlertTriangle, bg: 'var(--butter-soft)', color: '#c9931f', sub: '建议个别辅导' },
])

// ECharts 雷达图配置
const radarOption = computed(() => ({
  tooltip: { trigger: 'item', backgroundColor: '#fff', borderColor: '#ece0d5', borderRadius: 14, textStyle: { fontSize: 12 } },
  radar: {
    indicator: radarData.map((d) => ({ name: d.subject, max: 100 })),
    radius: '72%',
    axisName: { color: '#6d5e57', fontSize: 12, fontWeight: 600 },
    axisLine: { lineStyle: { color: '#ece0d5' } },
    splitLine: { lineStyle: { color: '#ece0d5' } },
    splitArea: { show: false },
  },
  series: [{
    type: 'radar',
    data: [{
      name: '本班',
      value: radarData.map((d) => d.value),
      lineStyle: { color: '#F2654C', width: 2 },
      itemStyle: { color: '#F2654C' },
      areaStyle: { color: 'rgba(242,101,76,0.32)' },
    }],
  }],
}))

// ECharts 横向柱状图：知识点掌握度（本班 vs 专业均分）
const knowledgeOption = computed(() => ({
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' }, backgroundColor: '#fff', borderColor: '#ece0d5', borderRadius: 14, textStyle: { fontSize: 12 } },
  legend: { show: false },
  grid: { left: 8, right: 16, top: 4, bottom: 4, containLabel: true },
  xAxis: {
    type: 'value', min: 0, max: 100,
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#a2938a', fontSize: 10 },
    splitLine: { lineStyle: { color: '#ece0d5', type: 'dashed' } },
  },
  yAxis: {
    type: 'category',
    data: knowledgePoints.map((k) => k.name),
    axisLine: { show: false }, axisTick: { show: false },
    axisLabel: { color: '#6d5e57', fontSize: 11 },
  },
  series: [
    {
      name: '本班', type: 'bar', barWidth: 13,
      data: knowledgePoints.map((k) => ({
        value: k.mastery,
        itemStyle: { color: k.mastery < k.classAvg ? '#F2654C' : '#3AA58F', borderRadius: [0, 6, 6, 0] },
      })),
    },
    {
      name: '专业均分', type: 'bar', barWidth: 13,
      data: knowledgePoints.map((k) => k.classAvg),
      itemStyle: { color: '#d8cdc3', borderRadius: [0, 6, 6, 0] },
    },
  ],
}))

function openCreateStudent() {
  editingStudent.value = null
  sForm.value = { ...emptyStudent, classId: data.classes[0]?.id ?? '' }
  studentModal.value = true
}
function openEditStudent(s) {
  editingStudent.value = s.id
  sForm.value = {
    name: s.name, classId: s.classId, attendance: s.attendance, avgScore: s.avgScore,
    homeworkRate: s.homeworkRate, participation: s.participation, status: s.status, trend: s.trend,
    studentNo: s.studentNo ?? '', major: s.major ?? '', grade: s.grade ?? '', gpa: s.gpa, credits: s.credits,
  }
  studentModal.value = true
}
function submitStudent() {
  if (!sForm.value.name.trim()) { showToast('请填写学生姓名'); return }
  if (!sForm.value.classId) { showToast('请选择班级'); return }
  if (editingStudent.value) {
    data.updateStudent(editingStudent.value, { ...sForm.value })
    showToast('学生信息已更新')
  } else {
    data.addStudent({ id: data.genId('s'), avatar: '', ...sForm.value })
    showToast('学生已添加')
    // 同步更新班级人数
    data.updateClass(sForm.value.classId, { studentCount: (data.classes.find((c) => c.id === sForm.value.classId)?.studentCount ?? 0) + 1 })
  }
  studentModal.value = false
}

function openCreateClass() {
  editingClass.value = null
  cForm.value = { ...emptyClass }
  classModal.value = true
}
function editClass(c) {
  editingClass.value = c.id
  cForm.value = {
    name: c.name, subject: c.subject, studentCount: c.studentCount, avgScore: c.avgScore,
    color: c.color, trend: c.trend, college: c.college ?? '', major: c.major ?? '', grade: c.grade ?? '', code: c.code ?? '',
  }
  classModal.value = true
}
function submitClass() {
  if (!cForm.value.name.trim()) { showToast('请填写班级名称'); return }
  if (editingClass.value) {
    data.updateClass(editingClass.value, { ...cForm.value })
    showToast('班级信息已更新')
  } else {
    data.addClass({ id: data.genId('c'), ...cForm.value })
    showToast('班级已添加')
  }
  classModal.value = false
}

function confirmDelete() {
  if (!pendingDelete.value) return
  if (pendingDelete.value.type === 'student') {
    const s = data.students.find((x) => x.id === pendingDelete.value.id)
    data.deleteStudent(pendingDelete.value.id)
    if (s) data.updateClass(s.classId, { studentCount: Math.max(0, (data.classes.find((c) => c.id === s.classId)?.studentCount ?? 0) - 1) })
  } else {
    data.deleteClass(pendingDelete.value.id)
  }
  pendingDelete.value = null
  showToast('已删除')
}
</script>

<template>
  <div>
    <SectionTitle
      eyebrow="LEARNING ANALYTICS"
      title="学生学情分析"
      desc="多维透视每位学生的学习状态，并直接管理班级与学生档案。"
    >
      <template #action>
        <div style="display: flex; gap: 10px">
          <button class="btn btn-ghost" @click="openCreateClass"><School :size="16" /> 添加班级</button>
          <button class="btn btn-primary" @click="openCreateStudent"><Plus :size="16" /> 添加学生</button>
        </div>
      </template>
    </SectionTitle>

    <!-- 概览统计 -->
    <div class="stat-grid">
      <div v-for="s in statCards" :key="s.label" class="stat-card">
        <div class="stat-card__top">
          <div class="stat-card__icon" :style="{ background: s.bg, color: s.color }"><component :is="s.icon" :size="22" /></div>
        </div>
        <div class="stat-card__label">{{ s.label }}</div>
        <div class="stat-card__value">{{ s.value }}<small>{{ s.unit }}</small></div>
        <div class="stat-card__foot">{{ s.sub }}</div>
      </div>
    </div>

    <!-- 班级管理条 -->
    <div class="panel" style="margin-bottom: 20px; padding: 16px 20px">
      <div class="panel__head" style="margin-bottom: 12px">
        <div class="panel__title" style="font-size: 0.98rem">
          <span class="ttl-icon" style="background: var(--sky-soft); color: var(--sky)"><School :size="16" /></span>
          我的班级
        </div>
        <button class="panel__action" @click="openCreateClass"><Plus :size="14" /> 新增班级</button>
      </div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap">
        <div
          v-for="c in data.classes" :key="c.id"
          style="display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: var(--r-md); border: 1px solid var(--line); background: var(--surface-2); flex: 1 1 200px"
        >
          <span style="width: 10px; height: 34px; border-radius: 5px; flex-shrink: 0" :style="{ background: c.color }" />
          <div style="flex: 1; min-width: 0">
            <div style="font-size: 0.86rem; font-weight: 700">{{ c.name }}</div>
            <div style="font-size: 0.68rem; color: var(--ink-3)">{{ c.studentCount }} 人 · 均分 {{ Number(c.avgScore).toFixed(1) }}</div>
            <div v-if="c.college || c.major || c.grade" style="font-size: 0.66rem; color: var(--ink-3)">
              {{ [c.college, c.major, c.grade].filter(Boolean).join(' · ') }}
            </div>
          </div>
          <div class="crud-actions">
            <button class="crud-icon-btn" title="编辑班级" @click="editClass(c)"><Edit2 :size="14" /></button>
            <button class="crud-icon-btn crud-icon-btn--danger" title="删除班级" @click="pendingDelete = { type: 'class', id: c.id, name: c.name }"><Trash2 :size="14" /></button>
          </div>
        </div>
        <div v-if="data.classes.length === 0" class="muted" style="font-size: 0.84rem; padding: 12px">还没有班级，点击"新增班级"创建。</div>
      </div>
    </div>

    <!-- 雷达 + 知识点 -->
    <div class="grid-2-even">
      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--coral-soft); color: var(--coral)"><Activity :size="17" /></span>
            班级能力画像
          </div>
          <span class="panel__sub">{{ data.classes[0]?.name ?? '本班' }} · 五维评估</span>
        </div>
        <VChart :option="radarOption" height="280px" />
        <div style="display: flex; gap: 16px; justify-content: center; margin-top: 4px">
          <span class="muted" style="font-size: 0.74rem">💡 出勤与作业表现优异，课堂参与度仍有提升空间</span>
        </div>
      </div>

      <div class="panel">
        <div class="panel__head">
          <div class="panel__title">
            <span class="ttl-icon" style="background: var(--mint-soft); color: var(--mint)"><Target :size="17" /></span>
            知识点掌握度
          </div>
          <div class="legend-dots">
            <span><i style="background: #F2654C" />本班</span>
            <span><i style="background: #d8cdc3" />专业均分</span>
          </div>
        </div>
        <VChart :option="knowledgeOption" height="280px" />
      </div>
    </div>

    <!-- 教学建议 -->
    <div class="grid-3" style="margin-bottom: 20px">
      <div v-for="ins in insights" :key="ins.title" class="insight-card">
        <div class="insight-card__icon" :style="{ background: `var(--${ins.tone}-soft)`, color: ins.tone === 'butter' ? '#c9931f' : `var(--${ins.tone})` }">
          <component :is="ins.icon" :size="20" />
        </div>
        <div>
          <div class="insight-card__title">{{ ins.title }}</div>
          <div class="insight-card__desc">{{ ins.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 学生明细表 -->
    <div class="panel">
      <div class="panel__head">
        <div class="panel__title">
          <span class="ttl-icon" style="background: var(--plum-soft); color: var(--plum)"><Users :size="17" /></span>
          学生学情明细
        </div>
        <span class="panel__sub">共 {{ filtered.length }} 名学生</span>
      </div>

      <div class="filter-bar">
        <div class="segmented">
          <button
            v-for="f in statusFilters" :key="f.key"
            :class="{ active: statusFilter === f.key }"
            @click="statusFilter = f.key"
          >{{ f.label }}</button>
        </div>
        <div class="search-inline">
          <Search :size="15" />
          <input v-model="query" placeholder="搜索学生姓名" />
        </div>
        <div style="margin-left: auto; display: flex; align-items: center; gap: 8px">
          <span class="muted" style="font-size: 0.76rem">班级</span>
          <select v-model="classFilter" class="ppt-select" style="padding: 8px 30px 8px 12px; width: 130px">
            <option value="all">全部班级</option>
            <option v-for="c in data.classes" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>
      </div>

      <div style="overflow-x: auto">
        <table class="student-table">
          <thead>
            <tr>
              <th>学生</th>
              <th style="cursor: pointer" @click="sortKey = 'avgScore'">平均分 ↓</th>
              <th style="cursor: pointer" @click="sortKey = 'attendance'">出勤率</th>
              <th style="cursor: pointer" @click="sortKey = 'homeworkRate'">作业完成</th>
              <th>课堂参与</th>
              <th>趋势</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in filtered" :key="s.id">
              <td>
                <div class="student-table__name">
                  <Avatar :name="s.name" :size="34" />
                  <div>
                    <div>{{ s.name }}</div>
                    <div style="font-size: 0.68rem; color: var(--ink-3); font-weight: 500">{{ data.classes.find((c) => c.id === s.classId)?.name }}</div>
                    <div v-if="s.studentNo || s.major" style="font-size: 0.66rem; color: var(--ink-3)">
                      {{ [s.studentNo, s.major].filter(Boolean).join(' · ') }}
                    </div>
                  </div>
                </div>
              </td>
              <td><strong style="font-family: var(--font-display); font-size: 1.05rem">{{ s.avgScore }}</strong></td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px">
                  <div class="mini-bar"><i :style="{ width: `${s.attendance}%`, background: s.attendance >= 90 ? 'var(--mint)' : 'var(--butter)' }" /></div>
                  <span style="font-size: 0.74rem; color: var(--ink-2)">{{ s.attendance }}%</span>
                </div>
              </td>
              <td>
                <div style="display: flex; align-items: center; gap: 8px">
                  <div class="mini-bar"><i :style="{ width: `${s.homeworkRate}%`, background: s.homeworkRate >= 85 ? 'var(--sky)' : 'var(--coral)' }" /></div>
                  <span style="font-size: 0.74rem; color: var(--ink-2)">{{ s.homeworkRate }}%</span>
                </div>
              </td>
              <td style="color: var(--ink-2)">{{ s.participation }}%</td>
              <td><Trend :value="s.trend" /></td>
              <td><StatusPill :status="s.status" /></td>
              <td>
                <div class="crud-actions">
                  <button class="crud-icon-btn" title="编辑学生" @click="openEditStudent(s)"><Edit2 :size="14" /></button>
                  <button class="crud-icon-btn crud-icon-btn--danger" title="删除学生" @click="pendingDelete = { type: 'student', id: s.id, name: s.name }"><Trash2 :size="14" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="filtered.length === 0" style="text-align: center; padding: 40px; color: var(--ink-3)">没有符合条件的学生，试试"添加学生"。</div>
      </div>
    </div>

    <!-- 学生表单 -->
    <Transition name="fade">
      <div v-if="studentModal">
        <div class="crud-overlay" @click="studentModal = false" />
        <div class="crud-modal" role="dialog" aria-modal="true">
          <div class="crud-modal__head">
            <div>
              <h2 class="crud-modal__title">{{ editingStudent ? '编辑学生' : '添加学生' }}</h2>
              <div class="crud-modal__sub">录入学生基础档案与学情指标</div>
            </div>
            <button class="crud-modal__close" @click="studentModal = false"><X :size="18" /></button>
          </div>
          <div class="crud-modal__body">
            <div class="crud-modal__grid">
              <FormField label="学生姓名" required>
                <input v-model="sForm.name" class="form-input" placeholder="例如：林知夏" />
              </FormField>
              <FormField label="所属班级" required>
                <select v-model="sForm.classId" class="form-select">
                  <option value="">请选择</option>
                  <option v-for="c in data.classes" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </FormField>
              <FormField label="平均分">
                <input v-model="sForm.avgScore" class="form-input" type="number" min="0" max="100" />
              </FormField>
              <FormField label="出勤率 (%)">
                <input v-model="sForm.attendance" class="form-input" type="number" min="0" max="100" />
              </FormField>
              <FormField label="作业完成 (%)">
                <input v-model="sForm.homeworkRate" class="form-input" type="number" min="0" max="100" />
              </FormField>
              <FormField label="课堂参与 (%)">
                <input v-model="sForm.participation" class="form-input" type="number" min="0" max="100" />
              </FormField>
              <FormField label="学情状态">
                <select v-model="sForm.status" class="form-select">
                  <option value="excellent">优秀</option>
                  <option value="good">良好</option>
                  <option value="warning">需关注</option>
                  <option value="risk">预警</option>
                </select>
              </FormField>
              <FormField label="成绩趋势 (%)">
                <input v-model="sForm.trend" class="form-input" type="number" step="0.1" />
              </FormField>
              <FormField label="学号">
                <input v-model="sForm.studentNo" class="form-input" placeholder="例如：202222001" />
              </FormField>
              <FormField label="专业">
                <select v-model="sForm.major" class="form-select">
                  <option value="">未指定</option>
                  <option v-for="m in MAJORS" :key="m" :value="m">{{ m }}</option>
                </select>
              </FormField>
              <FormField label="年级">
                <select class="form-select" :value="sForm.grade ?? ''" @change="sForm.grade = $event.target.value || undefined">
                  <option value="">未指定</option>
                  <option v-for="g in GRADES" :key="g" :value="g">{{ g }}</option>
                </select>
              </FormField>
              <FormField label="平均绩点 (0-4)">
                <input
                  class="form-input" type="number" min="0" max="4" step="0.1"
                  :value="sForm.gpa ?? ''"
                  @input="sForm.gpa = $event.target.value === '' ? undefined : Number($event.target.value)"
                />
              </FormField>
              <FormField label="已修学分">
                <input
                  class="form-input" type="number" min="0"
                  :value="sForm.credits ?? ''"
                  @input="sForm.credits = $event.target.value === '' ? undefined : Number($event.target.value)"
                />
              </FormField>
            </div>
          </div>
          <div class="crud-modal__foot">
            <button class="btn btn-ghost" @click="studentModal = false">取消</button>
            <button class="btn btn-primary" @click="submitStudent"><Check :size="16" /> 保存</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 班级表单 -->
    <Transition name="fade">
      <div v-if="classModal">
        <div class="crud-overlay" @click="classModal = false" />
        <div class="crud-modal" role="dialog" aria-modal="true">
          <div class="crud-modal__head">
            <div>
              <h2 class="crud-modal__title">{{ editingClass ? '编辑班级' : '添加班级' }}</h2>
              <div class="crud-modal__sub">创建新的教学班级档案</div>
            </div>
            <button class="crud-modal__close" @click="classModal = false"><X :size="18" /></button>
          </div>
          <div class="crud-modal__body">
            <div class="crud-modal__grid">
              <FormField label="班级名称" required>
                <input v-model="cForm.name" class="form-input" placeholder="例如：计科 2201 班" />
              </FormField>
              <FormField label="主要学科">
                <input v-model="cForm.subject" class="form-input" />
              </FormField>
              <FormField label="所属学院">
                <select v-model="cForm.college" class="form-select">
                  <option value="">未指定</option>
                  <option v-for="c in COLLEGES" :key="c" :value="c">{{ c }}</option>
                </select>
              </FormField>
              <FormField label="专业">
                <select v-model="cForm.major" class="form-select">
                  <option value="">未指定</option>
                  <option v-for="m in MAJORS" :key="m" :value="m">{{ m }}</option>
                </select>
              </FormField>
              <FormField label="年级">
                <select class="form-select" :value="cForm.grade ?? ''" @change="cForm.grade = $event.target.value || undefined">
                  <option value="">未指定</option>
                  <option v-for="g in GRADES" :key="g" :value="g">{{ g }}</option>
                </select>
              </FormField>
              <FormField label="班号">
                <input v-model="cForm.code" class="form-input" placeholder="例如：CS2201" />
              </FormField>
              <FormField label="学生人数">
                <input v-model="cForm.studentCount" class="form-input" type="number" min="0" />
              </FormField>
              <FormField label="班级均分">
                <input v-model="cForm.avgScore" class="form-input" type="number" min="0" max="100" step="0.1" />
              </FormField>
              <FormField label="成绩趋势 (%)">
                <input v-model="cForm.trend" class="form-input" type="number" step="0.1" />
              </FormField>
            </div>
            <FormField label="主题色">
              <div class="color-swatches">
                <button
                  v-for="c in CLASS_COLORS" :key="c" type="button"
                  class="color-swatch" :class="{ 'color-swatch--active': cForm.color === c }"
                  :style="{ background: c }" :aria-label="`选择颜色 ${c}`"
                  @click="cForm.color = c"
                />
              </div>
            </FormField>
          </div>
          <div class="crud-modal__foot">
            <button class="btn btn-ghost" @click="classModal = false">取消</button>
            <button class="btn btn-primary" @click="submitClass"><Check :size="16" /> 保存</button>
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmDialog
      v-if="pendingDelete"
      :title="`删除${pendingDelete.type === 'student' ? '学生' : '班级'}`"
      :message="pendingDelete.type === 'class'
        ? `确定删除班级「${pendingDelete.name}」吗？该班级下的学生和相关课程也会一并删除，此操作不可撤销。`
        : `确定删除学生「${pendingDelete.name}」吗？此操作不可撤销。`"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
    <Toast v-if="toast" :message="toast" />
  </div>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
