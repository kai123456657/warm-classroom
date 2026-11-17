<script setup>
/**
 * 教师端 · 课程安排（Vue 版）
 * 对照 React 版 Schedule.tsx 迁移：周课表网格 / 课程详情弹层 / 新增编辑表单 /
 * 删除确认 / 时段冲突检测 / 本周课时统计。
 */
import { ref, computed } from 'vue'
import {
  ChevronLeft, ChevronRight, CalendarDays, MapPin, Clock, Users, Plus,
  X, BookOpen, FlaskConical, Presentation, FileCheck2, GraduationCap,
  Edit2, Trash2, Check,
} from 'lucide-vue-next'
import { dayNames, periodTimes, SEMESTERS } from '@/data/mock'
import { useData } from '@/composables/useData'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Badge from '@/components/ui/Badge.vue'
import FormField from '@/components/ui/FormField.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'
import '@/styles/teacher.css'

const data = useData()

const typeMeta = {
  lecture: { label: '讲授', icon: BookOpen, color: '#F2654C' },
  lab: { label: '实验', icon: FlaskConical, color: '#5B8DEF' },
  seminar: { label: '研讨', icon: Presentation, color: '#9C6ADE' },
  exam: { label: '测验', icon: FileCheck2, color: '#E2543F' },
}

const legend = [
  { label: '讲授课程', color: '#F2654C' },
  { label: '实验课程', color: '#5B8DEF' },
  { label: '教研研讨', color: '#9C6ADE' },
  { label: '考试测验', color: '#E2543F' },
]

const COLORS = ['#F2654C', '#F4C244', '#3AA58F', '#5B8DEF', '#9C6ADE', '#E2543F']

const emptyForm = {
  title: '', day: 0, start: 1, duration: 2, room: '', classId: '', color: '#F2654C', type: 'lecture',
  code: '', credits: undefined, hours: undefined, semester: undefined,
}

const weekOffset = ref(0)
const selected = ref(null)
const formOpen = ref(false)
const editingId = ref(null)
const form = ref({ ...emptyForm })
const pendingDelete = ref(null)
const toast = ref('')

const today = (new Date().getDay() + 6) % 7 // 0=周一

function showToast(msg) {
  toast.value = msg
  window.setTimeout(() => { toast.value = '' }, 2200)
}

const weekLabel = computed(() => weekOffset.value === 0 ? '本周' : weekOffset.value > 0 ? `${weekOffset.value} 周后` : `${Math.abs(weekOffset.value)} 周前`)
const dateRange = computed(() => {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset.value * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return `${monday.getMonth() + 1}/${monday.getDate()} — ${sunday.getMonth() + 1}/${sunday.getDate()}`
})

// 按 (day, start) 建立索引，用于 grid 定位
const gridCells = computed(() => {
  const slotMap = new Map()
  data.schedule.forEach((c) => slotMap.set(`${c.day}-${c.start}`, c))
  const cells = []
  for (let period = 1; period <= 8; period++) {
    cells.push({ kind: 'time', key: `t-${period}`, period })
    for (let day = 0; day < 7; day++) {
      const course = slotMap.get(`${day}-${period}`)
      if (course) cells.push({ kind: 'course', key: `c-${day}-${period}`, course })
      else cells.push({ kind: 'empty', key: `e-${day}-${period}` })
    }
  }
  return cells
})

const totalHours = computed(() => data.schedule.reduce((s, c) => s + c.duration, 0))
const totalStudents = computed(() => data.classes.reduce((s, c) => s + c.studentCount, 0))

const overviewCards = computed(() => [
  { label: '本周课程', value: String(data.schedule.length), unit: '节', icon: CalendarDays, tone: 'coral', desc: '点击课表查看详情' },
  { label: '授课班级', value: String(data.classes.length), unit: '个', icon: GraduationCap, tone: 'sky', desc: `${totalStudents.value} 名学生` },
  { label: '总课时', value: String(totalHours.value), unit: '节', icon: Presentation, tone: 'plum', desc: '含实验与研讨' },
])

function openCreate() {
  editingId.value = null
  form.value = { ...emptyForm, color: '#F2654C', classId: data.classes[0]?.id ?? '' }
  selected.value = null
  formOpen.value = true
}

function openEdit(c) {
  editingId.value = c.id
  form.value = {
    title: c.title, day: c.day, start: c.start, duration: c.duration,
    room: c.room, classId: c.classId, color: c.color, type: c.type,
    code: c.code ?? '', credits: c.credits, hours: c.hours, semester: c.semester,
  }
  selected.value = null
  formOpen.value = true
}

function changeType(e) {
  const t = e.target.value
  form.value.type = t
  form.value.color = typeMeta[t].color
}

function submit() {
  if (!form.value.title.trim() || !form.value.room.trim()) {
    showToast('请填写课程名称和教室')
    return
  }
  // 时段冲突检测：同一(星期,起始节次)已有其他课程则阻止，避免课表网格覆盖导致课程不可见
  const conflict = data.schedule.find(
    (e) => e.day === form.value.day && e.start === form.value.start && e.id !== editingId.value,
  )
  if (conflict) {
    showToast(`${dayNames[form.value.day]}第${form.value.start}节已有「${conflict.title}」，请换个时间`)
    return
  }
  if (editingId.value) {
    data.updateSchedule(editingId.value, { ...form.value })
    showToast('课程已更新')
  } else {
    data.addSchedule({ id: data.genId('e'), ...form.value })
    showToast('课程已添加')
  }
  formOpen.value = false
}

function confirmDelete() {
  if (!pendingDelete.value) return
  data.deleteSchedule(pendingDelete.value.id)
  selected.value = null
  pendingDelete.value = null
  showToast('课程已删除')
}
</script>

<template>
  <div>
    <SectionTitle
      eyebrow="WEEKLY SCHEDULE"
      title="课程安排"
      desc="管理你的周授课计划，点击课程卡片查看详情，可新增、编辑或删除课程。"
    >
      <template #action>
        <button class="btn btn-primary" @click="openCreate"><Plus :size="16" /> 新增课程</button>
      </template>
    </SectionTitle>

    <div class="schedule-toolbar">
      <div class="week-nav">
        <button class="week-nav__btn" aria-label="上一周" @click="weekOffset--"><ChevronLeft :size="18" /></button>
        <div class="week-nav__label">{{ weekLabel }} · {{ dateRange }}</div>
        <button class="week-nav__btn" aria-label="下一周" @click="weekOffset++"><ChevronRight :size="18" /></button>
        <button v-if="weekOffset !== 0" class="chip" @click="weekOffset = 0">回到本周</button>
      </div>
      <div style="display: flex; align-items: center; gap: 10">
        <Badge tone="coral"><CalendarDays :size="12" /> 本周 {{ data.schedule.length }} 节</Badge>
        <Badge tone="mint">总课时 {{ totalHours }} 节</Badge>
      </div>
    </div>

    <div class="timetable-wrap">
      <div class="timetable">
        <div class="tt-head" style="font-size: 0.7rem">节次</div>
        <div
          v-for="(d, i) in dayNames"
          :key="d"
          class="tt-head"
          :class="{ 'tt-head--today': i === today && weekOffset === 0 }"
        >
          {{ d }}<small>{{ i === today && weekOffset === 0 ? '今天' : `周${d.slice(1)}` }}</small>
        </div>

        <template v-for="cell in gridCells" :key="cell.key">
          <div v-if="cell.kind === 'time'" class="tt-time">
            <span>{{ cell.period }}</span>
            <small>{{ periodTimes[cell.period - 1] }}</small>
          </div>
          <div
            v-else-if="cell.kind === 'course'"
            class="tt-slot"
            :style="{
              gridColumn: cell.course.day + 2,
              gridRow: `span ${cell.course.duration}`,
              background: `linear-gradient(145deg, ${cell.course.color}, ${cell.course.color}dd)`,
            }"
            @click="selected = cell.course"
          >
            <component :is="typeMeta[cell.course.type].icon" :size="13" class="tt-slot__type" />
            <div class="tt-slot__title">{{ cell.course.title }}</div>
            <div class="tt-slot__room"><MapPin :size="10" />{{ cell.course.room }}</div>
          </div>
          <div v-else class="tt-cell" />
        </template>
      </div>
      <div class="tt-legend">
        <span v-for="l in legend" :key="l.label"><i :style="{ background: l.color }" />{{ l.label }}</span>
      </div>
    </div>

    <!-- 今日概览 -->
    <div class="grid-3" style="margin-top: 20px">
      <div v-for="s in overviewCards" :key="s.label" class="panel" style="display: flex; align-items: center; gap: 16px">
        <div class="stat-card__icon" :style="{ background: `var(--${s.tone}-soft)`, color: `var(--${s.tone})`, width: '52px', height: '52px' }">
          <component :is="s.icon" :size="24" />
        </div>
        <div>
          <div class="muted" style="font-size: 0.78rem">{{ s.label }}</div>
          <div class="display" style="font-size: 1.7rem; font-weight: 600; line-height: 1.2">
            {{ s.value }}<small style="font-size: 0.85rem; font-family: var(--font-sans)"> {{ s.unit }}</small>
          </div>
          <div style="font-size: 0.7rem; color: var(--ink-3)">{{ s.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 课程详情弹层 -->
    <Transition name="fade">
      <div v-if="selected" class="modal-backdrop" @click="selected = null">
        <div class="modal-card" @click.stop>
          <div class="modal-card__head">
            <div>
              <div class="eyebrow" style="margin-bottom: 6px">课程详情</div>
              <h3 class="display" style="font-size: 1.6rem">{{ selected.title }}</h3>
            </div>
            <button class="modal-close" @click="selected = null"><X :size="18" /></button>
          </div>
          <div style="height: 6px; border-radius: 6px; background: selected.color; margin-bottom: 18px" />
          <div class="modal-row"><span><CalendarDays :size="14" style="display: inline; vertical-align: middle; margin-right: 6px" />时间</span><strong>{{ dayNames[selected.day] }} 第 {{ selected.start }}-{{ selected.start + selected.duration - 1 }} 节</strong></div>
          <div class="modal-row"><span><Clock :size="14" style="display: inline; vertical-align: middle; margin-right: 6px" />时段</span><strong>{{ periodTimes[selected.start - 1] }} — {{ periodTimes[selected.start + selected.duration - 1] }}</strong></div>
          <div class="modal-row"><span><MapPin :size="14" style="display: inline; vertical-align: middle; margin-right: 6px" />教室</span><strong>{{ selected.room }}</strong></div>
          <div class="modal-row"><span><Users :size="14" style="display: inline; vertical-align: middle; margin-right: 6px" />班级</span><strong>{{ data.classes.find((c) => c.id === selected.classId)?.name ?? '—' }}</strong></div>
          <div class="modal-row">
            <span>课程类型</span>
            <Badge :tone="selected.type === 'exam' ? 'coral' : selected.type === 'lab' ? 'sky' : selected.type === 'seminar' ? 'plum' : 'mint'">
              {{ typeMeta[selected.type].label }}
            </Badge>
          </div>
          <div v-if="selected.code" class="modal-row"><span>课程代码</span><strong>{{ selected.code }}</strong></div>
          <div v-if="selected.credits" class="modal-row"><span>学分</span><strong>{{ selected.credits }} 学分</strong></div>
          <div v-if="selected.hours" class="modal-row"><span>学时</span><strong>{{ selected.hours }} 学时</strong></div>
          <div v-if="selected.semester" class="modal-row"><span>开课学期</span><strong>{{ selected.semester }}</strong></div>
          <div style="display: flex; gap: 10px; margin-top: 22px">
            <button class="btn btn-primary" style="flex: 1" @click="selected = null">进入课堂</button>
            <button class="btn btn-ghost" @click="openEdit(selected)"><Edit2 :size="15" /> 编辑</button>
            <button class="btn btn-danger" @click="pendingDelete = selected"><Trash2 :size="15" /> 删除</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 新增/编辑课程表单 -->
    <Transition name="fade">
      <div v-if="formOpen">
        <div class="crud-overlay" @click="formOpen = false" />
        <div class="crud-modal" role="dialog" aria-modal="true">
          <div class="crud-modal__head">
            <div>
              <h2 class="crud-modal__title">{{ editingId ? '编辑课程' : '新增课程' }}</h2>
              <div class="crud-modal__sub">填写课程信息并保存到周课表</div>
            </div>
            <button class="crud-modal__close" @click="formOpen = false"><X :size="18" /></button>
          </div>
          <div class="crud-modal__body">
            <FormField label="课程名称" required>
              <input v-model="form.title" class="form-input" placeholder="例如：数据结构 · 计科2201" />
            </FormField>
            <div class="crud-modal__grid">
              <FormField label="上课班级">
                <select v-model="form.classId" class="form-select">
                  <option value="">未指定</option>
                  <option v-for="c in data.classes" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </FormField>
              <FormField label="课程类型">
                <select class="form-select" :value="form.type" @change="changeType">
                  <option v-for="(v, k) in typeMeta" :key="k" :value="k">{{ v.label }}</option>
                </select>
              </FormField>
              <FormField label="星期">
                <select v-model="form.day" class="form-select">
                  <option v-for="(d, i) in dayNames" :key="d" :value="i">{{ d }}</option>
                </select>
              </FormField>
              <FormField label="起始节次">
                <select v-model="form.start" class="form-select">
                  <option v-for="(t, i) in periodTimes" :key="i" :value="i + 1">第 {{ i + 1 }} 节 ({{ t }})</option>
                </select>
              </FormField>
              <FormField label="持续节次">
                <select v-model="form.duration" class="form-select">
                  <option v-for="n in [1, 2, 3, 4]" :key="n" :value="n">{{ n }} 节</option>
                </select>
              </FormField>
              <FormField label="教室" required>
                <input v-model="form.room" class="form-input" placeholder="例如：信息楼 A-301" />
              </FormField>
              <FormField label="课程代码">
                <input v-model="form.code" class="form-input" placeholder="例如：CS201" />
              </FormField>
              <FormField label="学分">
                <input
                  class="form-input" type="number" min="0"
                  :value="form.credits ?? ''"
                  @input="form.credits = $event.target.value === '' ? undefined : Number($event.target.value)"
                />
              </FormField>
              <FormField label="学时">
                <input
                  class="form-input" type="number" min="0"
                  :value="form.hours ?? ''"
                  @input="form.hours = $event.target.value === '' ? undefined : Number($event.target.value)"
                />
              </FormField>
              <FormField label="开课学期">
                <select
                  class="form-select" :value="form.semester ?? ''"
                  @change="form.semester = $event.target.value || undefined"
                >
                  <option value="">未指定</option>
                  <option v-for="s in SEMESTERS" :key="s" :value="s">{{ s }}</option>
                </select>
              </FormField>
            </div>
            <FormField label="主题色">
              <div class="color-swatches">
                <button
                  v-for="c in COLORS" :key="c" type="button"
                  class="color-swatch" :class="{ 'color-swatch--active': form.color === c }"
                  :style="{ background: c }" :aria-label="`选择颜色 ${c}`"
                  @click="form.color = c"
                />
              </div>
            </FormField>
          </div>
          <div class="crud-modal__foot">
            <button class="btn btn-ghost" @click="formOpen = false">取消</button>
            <button class="btn btn-primary" @click="submit"><Check :size="16" /> 保存课程</button>
          </div>
        </div>
      </div>
    </Transition>

    <ConfirmDialog
      v-if="pendingDelete"
      title="删除课程"
      :message="`确定删除「${pendingDelete.title}」吗？此操作不可撤销。`"
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
