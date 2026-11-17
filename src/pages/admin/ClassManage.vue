<script setup>
/**
 * 管理端 · 班级管理（完整 CRUD）
 */
import { ref, computed } from 'vue'
import {
  Search, Plus, ChevronRight, X, Users, GraduationCap, BookOpen, Edit2, Trash2,
} from 'lucide-vue-next'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Trend from '@/components/ui/Trend.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import FormField from '@/components/ui/FormField.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { useData } from '@/composables/useData'
import { COLLEGES, MAJORS } from '@/data/mock'
import '@/styles/admin.css'

const data = useData()

const COLORS = ['#F2654C', '#F4C244', '#3AA58F', '#5B8DEF', '#9C6ADE', '#FF9A52']
const GRADES = ['大一', '大二', '大三', '大四']

const emptyForm = () => ({
  name: '', subject: '', college: '', major: '', grade: '', code: '',
  studentCount: '0', avgScore: '0', trend: '0', color: COLORS[0],
})

const query = ref('')
const selectedId = ref(null)
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

const selected = computed(() => data.classes.find((c) => c.id === selectedId.value) ?? null)
const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return data.classes
  return data.classes.filter(
    (c) => c.name.toLowerCase().includes(q) || c.subject.toLowerCase().includes(q),
  )
})
const classStudents = computed(() => selected.value ? data.students.filter((s) => s.classId === selected.value.id) : [])
const isEdit = computed(() => editId.value !== null)
const swatches = computed(() => Array.from(new Set([...COLORS, form.value.color])))

function openAdd() {
  form.value = emptyForm()
  editId.value = null
  modalOpen.value = true
}
function openEdit(c) {
  form.value = {
    name: c.name,
    subject: c.subject,
    college: c.college ?? '',
    major: c.major ?? '',
    grade: c.grade ?? '',
    code: c.code ?? '',
    studentCount: String(c.studentCount),
    avgScore: String(c.avgScore),
    trend: String(c.trend),
    color: c.color,
  }
  editId.value = c.id
  modalOpen.value = true
}
function editFromDrawer() {
  if (!selected.value) return
  const c = selected.value
  selectedId.value = null
  openEdit(c)
}

function submit() {
  if (!form.value.name.trim() || !form.value.subject.trim()) {
    showToast('请填写班级名称和学科', 'danger')
    return
  }
  const payload = {
    name: form.value.name.trim(),
    subject: form.value.subject.trim(),
    college: form.value.college.trim() || undefined,
    major: form.value.major.trim() || undefined,
    grade: form.value.grade || undefined,
    code: form.value.code.trim() || undefined,
    studentCount: Math.max(0, Number(form.value.studentCount) || 0),
    avgScore: Math.min(100, Math.max(0, Number(form.value.avgScore) || 0)),
    trend: Number(form.value.trend) || 0,
    color: form.value.color,
  }
  if (isEdit.value && editId.value) {
    data.updateClass(editId.value, payload)
    showToast('班级已更新')
  } else {
    data.addClass({ id: data.genId('c'), ...payload })
    showToast('班级已创建')
  }
  modalOpen.value = false
}

function confirmDelete() {
  if (!pendingDelete.value) return
  data.deleteClass(pendingDelete.value.id)
  pendingDelete.value = null
  showToast('班级已删除')
}
</script>

<template>
  <div class="adm-page">
    <div class="adm-toolbar">
      <div class="adm-toolbar__left">
        <SectionTitle eyebrow="CLASS MANAGEMENT · 班级管理" title="班级一览" desc="全校班级信息与学情表现" />
      </div>
      <div class="adm-toolbar__right">
        <label class="adm-search">
          <Search :size="17" />
          <input v-model="query" type="text" placeholder="搜索班级或学科…" aria-label="搜索班级" />
        </label>
        <button class="btn btn-primary" type="button" @click="openAdd">
          <Plus :size="17" /> 新增班级
        </button>
      </div>
    </div>

    <div class="adm-count">共 <b>{{ filtered.length }}</b> 个班级</div>

    <div v-if="filtered.length > 0" class="adm-class-grid">
      <article v-for="c in filtered" :key="c.id" class="adm-class-card">
        <span class="adm-class-card__accent" :style="{ background: c.color }" />
        <div class="adm-class-card__top">
          <span class="adm-class-card__badge" :style="{ background: `${c.color}1a`, color: c.color }">
            <BookOpen :size="13" /> {{ c.subject }}
          </span>
          <Trend :value="c.trend" />
        </div>
        <h3 class="adm-class-card__name">{{ c.name }}</h3>
        <div class="adm-class-card__meta">
          {{ [c.college, c.major, c.grade, c.code].filter(Boolean).join(' · ') || '专业班级' }} · 教学进行中
        </div>
        <div class="adm-class-card__stats">
          <div class="adm-class-card__stat">
            <span>班级均分</span>
            <strong>{{ c.avgScore.toFixed(1) }}</strong>
          </div>
          <div class="adm-class-card__stat">
            <span>学生人数</span>
            <strong>{{ c.studentCount }}<small> 人</small></strong>
          </div>
        </div>
        <div class="adm-class-card__foot">
          <span class="adm-class-card__meta">
            <Users :size="13" style="vertical-align: -2px; margin-right: 4px" />
            {{ c.studentCount }} 名在读
          </span>
          <div class="crud-actions">
            <button class="adm-link-btn" type="button" @click="selectedId = c.id">
              详情 <ChevronRight :size="15" />
            </button>
            <button class="crud-icon-btn" type="button" title="编辑" @click="openEdit(c)">
              <Edit2 :size="15" />
            </button>
            <button class="crud-icon-btn crud-icon-btn--danger" type="button" title="删除" @click="pendingDelete = c">
              <Trash2 :size="15" />
            </button>
          </div>
        </div>
      </article>
    </div>
    <div v-else class="adm-panel">
      <EmptyState title="没有找到匹配的班级" desc="试试更换关键词，或检查学科名称。">
        <template #icon><Search :size="30" /></template>
      </EmptyState>
    </div>

    <!-- 详情抽屉 -->
    <template v-if="selected">
      <div class="adm-overlay" @click="selectedId = null" />
      <aside class="adm-drawer" role="dialog" :aria-label="`${selected.name} 详情`">
        <div class="adm-drawer__head">
          <div>
            <span class="eyebrow">CLASS DETAIL</span>
            <h2 class="adm-drawer__title">{{ selected.name }}</h2>
          </div>
          <button class="adm-drawer__close" type="button" aria-label="关闭" @click="selectedId = null">
            <X :size="18" />
          </button>
        </div>
        <div class="adm-drawer__body">
          <div class="adm-drawer__stats">
            <div class="adm-drawer__stat"><strong>{{ selected.avgScore.toFixed(1) }}</strong><span>班级均分</span></div>
            <div class="adm-drawer__stat"><strong>{{ selected.studentCount }}</strong><span>在读学生</span></div>
            <div class="adm-drawer__stat"><strong>{{ selected.subject }}</strong><span>主修专业</span></div>
          </div>

          <template v-if="selected.college || selected.major || selected.grade || selected.code">
            <div class="adm-drawer__label">班级信息</div>
            <div class="adm-info-list">
              <div v-if="selected.college" class="adm-info-row"><span>所属学院</span><strong>{{ selected.college }}</strong></div>
              <div v-if="selected.major" class="adm-info-row"><span>专业</span><strong>{{ selected.major }}</strong></div>
              <div v-if="selected.grade" class="adm-info-row"><span>年级</span><strong>{{ selected.grade }}</strong></div>
              <div v-if="selected.code" class="adm-info-row"><span>班号</span><strong>{{ selected.code }}</strong></div>
            </div>
          </template>

          <div class="adm-drawer__label">
            <GraduationCap :size="13" style="vertical-align: -2px; margin-right: 5px" />
            班级学生 · {{ classStudents.length }} 人
          </div>

          <div v-if="classStudents.length > 0">
            <div v-for="s in classStudents" :key="s.id" class="adm-student-row">
              <Avatar :name="s.name" :size="38" />
              <div class="adm-student-row__info">
                <div class="adm-student-row__name">{{ s.name }}</div>
                <div class="adm-class-card__meta">出勤 {{ s.attendance }}% · 作业 {{ s.homeworkRate }}%</div>
              </div>
              <div class="adm-student-row__score">{{ s.avgScore }}<small> 分</small></div>
            </div>
          </div>
          <EmptyState v-else title="暂无学生档案" desc="该班级学生数据尚未录入系统。">
            <template #icon><Users :size="28" /></template>
          </EmptyState>

          <div style="margin-top: 26px; display: flex; gap: 10px">
            <button class="btn btn-primary btn-sm" type="button" @click="editFromDrawer">
              <Edit2 :size="15" /> 编辑此班级
            </button>
          </div>
        </div>
      </aside>
    </template>

    <!-- 新增 / 编辑模态框 -->
    <template v-if="modalOpen">
      <div class="crud-overlay" @click="modalOpen = false" />
      <div class="crud-modal" role="dialog" aria-modal="true" :aria-label="isEdit ? '编辑班级' : '新增班级'">
        <div class="crud-modal__head">
          <div>
            <h2 class="crud-modal__title">{{ isEdit ? '编辑班级' : '新增班级' }}</h2>
            <div class="crud-modal__sub">维护班级基础信息与学情表现</div>
          </div>
          <button class="crud-modal__close" type="button" @click="modalOpen = false">
            <X :size="18" />
          </button>
        </div>
        <div class="crud-modal__body">
          <div class="crud-modal__grid">
            <FormField label="班级名称" required>
              <input v-model="form.name" class="form-input" type="text" placeholder="如：计科 2201 班" />
            </FormField>
            <FormField label="学科" required>
              <input v-model="form.subject" class="form-input" type="text" placeholder="如：数学" />
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="所属学院">
              <select v-model="form.college" class="form-select">
                <option value="">请选择学院</option>
                <option v-for="x in COLLEGES" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
            <FormField label="专业">
              <select v-model="form.major" class="form-select">
                <option value="">请选择专业</option>
                <option v-for="x in MAJORS" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="年级">
              <select v-model="form.grade" class="form-select">
                <option value="">请选择年级</option>
                <option v-for="x in GRADES" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
            <FormField label="班号">
              <input v-model="form.code" class="form-input" type="text" placeholder="如：CS2201" />
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="学生人数" hint="不少于 0">
              <input v-model="form.studentCount" class="form-input" type="number" min="0" />
            </FormField>
            <FormField label="班级均分" hint="0 - 100">
              <input v-model="form.avgScore" class="form-input" type="number" min="0" max="100" step="0.1" />
            </FormField>
          </div>
          <FormField label="成绩趋势" hint="正数上升、负数下降">
            <input v-model="form.trend" class="form-input" type="number" />
          </FormField>
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
      title="删除班级"
      :message="`确定删除「${pendingDelete.name}」吗？该班级的学生与相关课程也会被移除，且不可恢复。`"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />

    <Toast v-if="toast" :message="toast.message" :tone="toast.tone" />
  </div>
</template>
