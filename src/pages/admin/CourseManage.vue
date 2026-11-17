<script setup>
/**
 * 管理端 · 课程管理（完整 CRUD + 列表/日历视图）
 */
import { ref, computed } from 'vue'
import {
  List, CalendarDays, BookOpen, Clock, MapPin, Plus, Edit2, Trash2, X,
} from 'lucide-vue-next'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Badge from '@/components/ui/Badge.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormField from '@/components/ui/FormField.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'
import { useData } from '@/composables/useData'
import { SEMESTERS, dayNames, periodTimes } from '@/data/mock'
import '@/styles/admin.css'

const data = useData()

const COLORS = ['#F2654C', '#F4C244', '#3AA58F', '#5B8DEF', '#9C6ADE', '#FF9A52']
const TYPE_OPTIONS = [
  { value: 'lecture', label: '讲授' },
  { value: 'lab', label: '实验' },
  { value: 'seminar', label: '研讨' },
  { value: 'exam', label: '测验' },
]
const STATUS_OPTIONS = ['进行中', '待开课', '已完成']
const typeMeta = {
  lecture: { label: '讲授', tone: 'coral' },
  lab: { label: '实验', tone: 'sky' },
  seminar: { label: '研讨', tone: 'plum' },
  exam: { label: '测验', tone: 'butter' },
}
const statusTone = { 进行中: 'mint', 待开课: 'butter', 已完成: 'sky' }
const typeTabs = [
  { key: 'all', label: '全部' },
  { key: 'lecture', label: '讲授' },
  { key: 'lab', label: '实验' },
  { key: 'seminar', label: '研讨' },
  { key: 'exam', label: '测验' },
]

const emptyForm = () => ({
  title: '', code: '', credits: '4', hours: '64', semester: SEMESTERS[0],
  teacher: '', className: '', day: 0, start: 1, duration: 1,
  room: '', type: 'lecture', status: '待开课', color: COLORS[0],
})

const active = ref('all')
const view = ref('list')
const modalOpen = ref(false)
const editId = ref(null)
const form = ref(emptyForm())
const pendingDelete = ref(null)
const toast = ref(null)

let toastTimer = null
function showToast(message, tone = 'success') {
  toast.value = { message, tone }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 2000)
}

const filtered = computed(() => active.value === 'all'
  ? data.adminCourses
  : data.adminCourses.filter((c) => c.type === active.value))
const isEdit = computed(() => editId.value !== null)
const swatches = computed(() => Array.from(new Set([...COLORS, form.value.color])))

function timeText(c) {
  const end = c.start + c.duration - 1
  return `${dayNames[c.day]} 第${c.start}${end > c.start ? `–${end}` : ''}节 · ${periodTimes[c.start - 1]}`
}

function openAdd() {
  form.value = emptyForm()
  editId.value = null
  modalOpen.value = true
}
function openEdit(c) {
  form.value = {
    title: c.title,
    code: c.code ?? '',
    credits: c.credits != null ? String(c.credits) : '',
    hours: c.hours != null ? String(c.hours) : '',
    semester: c.semester ?? SEMESTERS[0],
    teacher: c.teacher,
    className: c.className,
    day: c.day,
    start: c.start,
    duration: c.duration,
    room: c.room,
    type: c.type,
    status: c.status,
    color: c.color,
  }
  editId.value = c.id
  modalOpen.value = true
}

function submit() {
  if (!form.value.title.trim()) {
    showToast('请填写课程名称', 'danger')
    return
  }
  const payload = {
    title: form.value.title.trim(),
    code: form.value.code.trim() || undefined,
    credits: form.value.credits.trim() ? Math.max(0, Number(form.value.credits) || 0) : undefined,
    hours: form.value.hours.trim() ? Math.max(0, Number(form.value.hours) || 0) : undefined,
    semester: form.value.semester || undefined,
    teacher: form.value.teacher.trim(),
    className: form.value.className.trim(),
    day: Math.min(6, Math.max(0, Number(form.value.day) || 0)),
    start: Math.min(8, Math.max(1, Number(form.value.start) || 1)),
    duration: Math.min(4, Math.max(1, Number(form.value.duration) || 1)),
    room: form.value.room.trim(),
    type: form.value.type,
    status: form.value.status,
    color: form.value.color,
  }
  if (isEdit.value && editId.value) {
    data.updateAdminCourse(editId.value, payload)
    showToast('课程已更新')
  } else {
    data.addAdminCourse({ id: data.genId('k'), ...payload })
    showToast('课程已创建')
  }
  modalOpen.value = false
}

function confirmDelete() {
  if (!pendingDelete.value) return
  data.deleteAdminCourse(pendingDelete.value.id)
  pendingDelete.value = null
  showToast('课程已删除')
}
</script>

<template>
  <div class="adm-page">
    <div class="adm-toolbar">
      <div class="adm-toolbar__left">
        <SectionTitle eyebrow="CURRICULUM · 课程管理" title="课程安排" desc="全校课程计划、授课进度与周课表" />
      </div>
      <div class="adm-toolbar__right">
        <button class="btn btn-primary" type="button" @click="openAdd">
          <Plus :size="17" /> 新增课程
        </button>
        <div class="adm-viewtoggle">
          <button type="button" :class="{ active: view === 'list' }" @click="view = 'list'">
            <List :size="15" /> 列表
          </button>
          <button type="button" :class="{ active: view === 'calendar' }" @click="view = 'calendar'">
            <CalendarDays :size="15" /> 日历
          </button>
        </div>
      </div>
    </div>

    <div class="adm-toolbar">
      <div class="adm-tabs" role="tablist" aria-label="按课程类型筛选">
        <button
          v-for="t in typeTabs"
          :key="t.key"
          type="button"
          role="tab"
          :aria-selected="active === t.key"
          class="adm-tab"
          :class="{ 'adm-tab--active': active === t.key }"
          @click="active = t.key"
        >{{ t.label }}</button>
      </div>
      <div class="adm-count">共 <b>{{ filtered.length }}</b> 门课程</div>
    </div>

    <div v-if="filtered.length === 0" class="adm-panel">
      <EmptyState title="暂无课程" desc="该类型下还没有课程安排。">
        <template #icon><BookOpen :size="28" /></template>
      </EmptyState>
    </div>

    <!-- 列表视图 -->
    <div v-else-if="view === 'list'" class="adm-table-wrap">
      <table class="adm-table">
        <thead>
          <tr>
            <th>课程名称</th>
            <th>授课教师</th>
            <th>班级</th>
            <th>时间</th>
            <th>教室</th>
            <th>类型</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="c in filtered" :key="c.id">
            <td>
              <span class="adm-type adm-cell-strong">
                <i class="adm-type__dot" :style="{ background: c.color }" />
                {{ c.title }}
              </span>
              <div v-if="c.code || c.credits != null" class="adm-class-card__meta" style="margin-top: 2px">
                <span v-if="c.code">{{ c.code }} · </span>
                <span v-if="c.credits != null">{{ c.credits }} 学分</span>
              </div>
            </td>
            <td class="adm-cell-strong">{{ c.teacher }}</td>
            <td>{{ c.className }}</td>
            <td>
              <span class="adm-type">
                <Clock :size="13" style="color: var(--ink-3)" />
                {{ timeText(c) }}
              </span>
            </td>
            <td>
              <span class="adm-type">
                <MapPin :size="13" style="color: var(--ink-3)" />
                {{ c.room }}
              </span>
            </td>
            <td><Badge :tone="typeMeta[c.type].tone">{{ typeMeta[c.type].label }}</Badge></td>
            <td><Badge :tone="statusTone[c.status]">{{ c.status }}</Badge></td>
            <td>
              <div class="adm-row-actions">
                <button class="adm-icon-btn adm-icon-btn--edit" type="button" title="编辑" @click="openEdit(c)">
                  <Edit2 :size="14" /> 编辑
                </button>
                <button class="adm-icon-btn" type="button" title="删除" style="color: var(--danger)" @click="pendingDelete = c">
                  <Trash2 :size="14" /> 删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 日历视图 -->
    <div v-else class="adm-cal">
      <div class="adm-cal__grid">
        <div class="adm-cal__corner">节次</div>
        <div v-for="d in dayNames.slice(0, 5)" :key="d" class="adm-cal__day">
          {{ d }}
          <span>第 {{ dayNames.indexOf(d) + 1 }} 天</span>
        </div>

        <div v-for="period in 8" :key="period" style="display: contents">
          <div class="adm-cal__time">
            <b>{{ period }}</b>
            <span>{{ periodTimes[period - 1] }}</span>
          </div>
          <div v-for="day in 5" :key="`${day - 1}-${period}`" class="adm-cal__cell">
            <div
              v-for="c in filtered.filter((x) => x.day === day - 1 && x.start === period)"
              :key="c.id"
              class="adm-cal__event"
              :title="`${c.title} · ${c.teacher} · ${c.room}（点击编辑）`"
              :style="{ background: `${c.color}1a`, color: c.color, cursor: 'pointer' }"
              @click="openEdit(c)"
            >
              <b>{{ c.title }}</b>
              <span>{{ c.teacher }} · {{ c.room }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增 / 编辑课程模态框 -->
    <template v-if="modalOpen">
      <div class="crud-overlay" @click="modalOpen = false" />
      <div class="crud-modal" role="dialog" aria-modal="true" :aria-label="isEdit ? '编辑课程' : '新增课程'">
        <div class="crud-modal__head">
          <div>
            <h2 class="crud-modal__title">{{ isEdit ? '编辑课程' : '新增课程' }}</h2>
            <div class="crud-modal__sub">设置课程信息、时间与授课安排</div>
          </div>
          <button class="crud-modal__close" type="button" @click="modalOpen = false">
            <X :size="18" />
          </button>
        </div>
        <div class="crud-modal__body">
          <FormField label="课程名称" required>
            <input v-model="form.title" class="form-input" type="text" placeholder="如：数据结构与算法" />
          </FormField>
          <div class="crud-modal__grid">
            <FormField label="课程代码">
              <input v-model="form.code" class="form-input" type="text" placeholder="如：CS201" />
            </FormField>
            <FormField label="学分">
              <input v-model="form.credits" class="form-input" type="number" min="0" />
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="学时">
              <input v-model="form.hours" class="form-input" type="number" min="0" />
            </FormField>
            <FormField label="开课学期">
              <select v-model="form.semester" class="form-select">
                <option v-for="x in SEMESTERS" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="授课教师">
              <input v-model="form.teacher" class="form-input" type="text" placeholder="教师姓名" />
            </FormField>
            <FormField label="班级">
              <input v-model="form.className" class="form-input" type="text" placeholder="如：计科 2201 班" />
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="星期">
              <select v-model="form.day" class="form-select">
                <option v-for="(d, i) in dayNames" :key="d" :value="i">{{ d }}</option>
              </select>
            </FormField>
            <FormField label="教室">
              <input v-model="form.room" class="form-input" type="text" placeholder="如：信息楼 A-301" />
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="起始节次" hint="1 - 8">
              <select v-model="form.start" class="form-select">
                <option v-for="n in 8" :key="n" :value="n">第 {{ n }} 节</option>
              </select>
            </FormField>
            <FormField label="持续节次" hint="1 - 4">
              <select v-model="form.duration" class="form-select">
                <option v-for="n in 4" :key="n" :value="n">{{ n }} 节</option>
              </select>
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="课程类型">
              <select v-model="form.type" class="form-select">
                <option v-for="x in TYPE_OPTIONS" :key="x.value" :value="x.value">{{ x.label }}</option>
              </select>
            </FormField>
            <FormField label="状态">
              <select v-model="form.status" class="form-select">
                <option v-for="x in STATUS_OPTIONS" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
          </div>
          <FormField label="主题色">
            <div class="color-swatches">
              <button
                v-for="color in swatches"
                :key="color"
                type="button"
                class="color-swatch"
                :class="{ 'color-swatch--active': form.color === color }"
                :style="{ background: color }"
                :aria-label="`选择颜色 ${color}`"
                @click="form.color = color"
              />
            </div>
          </FormField>
        </div>
        <div class="crud-modal__foot">
          <button class="btn btn-ghost" type="button" @click="modalOpen = false">取消</button>
          <button class="btn btn-primary" type="button" @click="submit">保存</button>
        </div>
      </div>
    </template>

    <ConfirmDialog
      v-if="pendingDelete"
      title="删除课程"
      :message="`确定删除课程「${pendingDelete.title}」吗？此操作不可恢复。`"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />

    <Toast v-if="toast" :message="toast.message" :tone="toast.tone" />
  </div>
</template>
