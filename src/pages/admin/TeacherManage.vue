<script setup>
/**
 * 管理端 · 教师管理（完整 CRUD）
 */
import { ref, computed } from 'vue'
import {
  Eye, Edit2, X, GraduationCap, BookOpen, Users, CalendarDays, Plus, Trash2,
} from 'lucide-vue-next'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import Badge from '@/components/ui/Badge.vue'
import FormField from '@/components/ui/FormField.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Toast from '@/components/ui/Toast.vue'
import Avatar from '@/components/ui/Avatar.vue'
import { useData } from '@/composables/useData'
import { COLLEGES } from '@/data/mock'
import '@/styles/admin.css'

const data = useData()

const TITLE_OPTIONS = ['教授', '副教授', '讲师', '助教']
const DEGREE_OPTIONS = ['博士', '硕士', '学士']
const STATUS_OPTIONS = ['在职', '教研中', '请假']
const statusTone = { 在职: 'mint', 教研中: 'sky', 请假: 'butter' }

const emptyForm = () => ({
  name: '', subject: '', title: TITLE_OPTIONS[0], college: '', degree: DEGREE_OPTIONS[0], research: '',
  classes: '0', students: '0', years: '0', status: '在职',
})

const active = ref('全部')
const selectedId = ref(null)
const mode = ref('view')
const modalOpen = ref(false)
const form = ref(emptyForm())
const pendingDelete = ref(null)
const toast = ref(null)

let toastTimer = null
function showToast(message, tone = 'success') {
  toast.value = { message, tone }
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toast.value = null }, 2000)
}

const selected = computed(() => data.teachers.find((t) => t.id === selectedId.value) ?? null)
const subjectTabs = computed(() => ['全部', ...Array.from(new Set(data.teachers.map((t) => t.subject)))])
const currentTab = computed(() => subjectTabs.value.includes(active.value) ? active.value : '全部')
const filtered = computed(() => currentTab.value === '全部'
  ? data.teachers
  : data.teachers.filter((t) => t.subject === currentTab.value))

function openAdd() {
  form.value = emptyForm()
  modalOpen.value = true
}
function open(t, m) {
  mode.value = m
  if (m === 'edit') {
    form.value = {
      name: t.name,
      subject: t.subject,
      title: t.title,
      college: t.college ?? '',
      degree: t.degree ?? DEGREE_OPTIONS[0],
      research: t.research ?? '',
      classes: String(t.classes),
      students: String(t.students),
      years: String(t.years),
      status: t.status,
    }
  }
  selectedId.value = t.id
}

function buildPayload() {
  return {
    name: form.value.name.trim(),
    subject: form.value.subject.trim(),
    title: form.value.title,
    college: form.value.college.trim() || undefined,
    degree: form.value.degree || undefined,
    research: form.value.research.trim() || undefined,
    classes: Math.max(0, Number(form.value.classes) || 0),
    students: Math.max(0, Number(form.value.students) || 0),
    years: Math.max(0, Number(form.value.years) || 0),
    status: form.value.status,
  }
}
function submitAdd() {
  if (!form.value.name.trim() || !form.value.subject.trim()) {
    showToast('请填写姓名和学科', 'danger')
    return
  }
  data.addTeacher({ id: data.genId('t'), ...buildPayload() })
  modalOpen.value = false
  showToast('教师已添加')
}
function saveEdit() {
  if (!selected.value) return
  if (!form.value.name.trim() || !form.value.subject.trim()) {
    showToast('请填写姓名和学科', 'danger')
    return
  }
  data.updateTeacher(selected.value.id, buildPayload())
  selectedId.value = null
  showToast('教师资料已更新')
}
function confirmDelete() {
  if (!pendingDelete.value) return
  data.deleteTeacher(pendingDelete.value.id)
  pendingDelete.value = null
  showToast('教师已删除')
}
</script>

<template>
  <div class="adm-page">
    <div class="adm-toolbar">
      <div class="adm-toolbar__left">
        <SectionTitle eyebrow="FACULTY · 教师管理" title="教师档案" desc="全校在职教师一览与教学工作量" />
      </div>
      <div class="adm-toolbar__right">
        <span class="adm-count">共 <b>{{ filtered.length }}</b> 位教师</span>
        <button class="btn btn-primary" type="button" @click="openAdd">
          <Plus :size="17" /> 新增教师
        </button>
      </div>
    </div>

    <div class="adm-tabs" role="tablist" aria-label="按学科筛选">
      <button
        v-for="s in subjectTabs"
        :key="s"
        type="button"
        role="tab"
        :aria-selected="currentTab === s"
        class="adm-tab"
        :class="{ 'adm-tab--active': currentTab === s }"
        @click="active = s"
      >{{ s }}</button>
    </div>

    <div class="adm-table-wrap">
      <table class="adm-table">
        <thead>
          <tr>
            <th>教师</th>
            <th>学科</th>
            <th>职称</th>
            <th>授课班级</th>
            <th>学生数</th>
            <th>教龄</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="t in filtered" :key="t.id">
            <td>
              <div class="adm-user">
                <Avatar :name="t.name" :size="38" />
                <div class="adm-user__info">
                  <span class="adm-user__name">{{ t.name }}</span>
                  <span class="adm-user__sub">工号 {{ t.id.toUpperCase() }}</span>
                </div>
              </div>
            </td>
            <td>
              <span class="adm-cell-strong">
                <BookOpen :size="13" style="vertical-align: -2px; margin-right: 5px; color: var(--coral)" />
                {{ t.subject }}
              </span>
            </td>
            <td>{{ t.title }}</td>
            <td class="adm-cell-strong">{{ t.classes }} 个</td>
            <td>{{ t.students }} 人</td>
            <td>{{ t.years }} 年</td>
            <td><Badge :tone="statusTone[t.status]">{{ t.status }}</Badge></td>
            <td>
              <div class="adm-row-actions">
                <button class="adm-icon-btn" type="button" title="查看" @click="open(t, 'view')">
                  <Eye :size="14" /> 查看
                </button>
                <button class="adm-icon-btn adm-icon-btn--edit" type="button" title="编辑" @click="open(t, 'edit')">
                  <Edit2 :size="14" /> 编辑
                </button>
                <button class="adm-icon-btn" type="button" title="删除" style="color: var(--danger)" @click="pendingDelete = t">
                  <Trash2 :size="14" /> 删除
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 查看 / 编辑抽屉 -->
    <template v-if="selected">
      <div class="adm-overlay" @click="selectedId = null" />
      <aside class="adm-drawer" role="dialog" :aria-label="`${selected.name} 教师${mode === 'edit' ? '编辑' : '档案'}`">
        <div class="adm-drawer__head">
          <div>
            <span class="eyebrow">{{ mode === 'edit' ? 'EDIT PROFILE · 编辑资料' : 'FACULTY PROFILE · 教师档案' }}</span>
            <h2 class="adm-drawer__title">{{ selected.name }}</h2>
          </div>
          <button class="adm-drawer__close" type="button" aria-label="关闭" @click="selectedId = null">
            <X :size="18" />
          </button>
        </div>
        <div class="adm-drawer__body">
          <!-- 编辑模式：复用表单 -->
          <template v-if="mode === 'edit'">
            <div style="display: flex; flex-direction: column; gap: 16px">
              <div class="crud-modal__grid">
                <FormField label="姓名" required>
                  <input v-model="form.name" class="form-input" type="text" placeholder="请输入姓名" />
                </FormField>
                <FormField label="学科" required>
                  <input v-model="form.subject" class="form-input" type="text" placeholder="如：数学" />
                </FormField>
              </div>
              <div class="crud-modal__grid">
                <FormField label="职称">
                  <select v-model="form.title" class="form-select">
                    <option v-for="x in TITLE_OPTIONS" :key="x" :value="x">{{ x }}</option>
                  </select>
                </FormField>
                <FormField label="状态">
                  <select v-model="form.status" class="form-select">
                    <option v-for="x in STATUS_OPTIONS" :key="x" :value="x">{{ x }}</option>
                  </select>
                </FormField>
              </div>
              <div class="crud-modal__grid">
                <FormField label="所属学院">
                  <select v-model="form.college" class="form-select">
                    <option value="">请选择学院</option>
                    <option v-for="x in COLLEGES" :key="x" :value="x">{{ x }}</option>
                  </select>
                </FormField>
                <FormField label="学位">
                  <select v-model="form.degree" class="form-select">
                    <option v-for="x in DEGREE_OPTIONS" :key="x" :value="x">{{ x }}</option>
                  </select>
                </FormField>
              </div>
              <div class="crud-modal__grid">
                <FormField label="授课班级数">
                  <input v-model="form.classes" class="form-input" type="number" min="0" />
                </FormField>
                <FormField label="学生数">
                  <input v-model="form.students" class="form-input" type="number" min="0" />
                </FormField>
              </div>
              <FormField label="教龄（年）">
                <input v-model="form.years" class="form-input" type="number" min="0" />
              </FormField>
              <FormField label="研究方向">
                <input v-model="form.research" class="form-input" type="text" placeholder="如：分布式系统" />
              </FormField>
            </div>
            <div class="crud-modal__foot">
              <button class="btn btn-ghost" type="button" @click="selectedId = null">取消</button>
              <button class="btn btn-primary" type="button" @click="saveEdit">保存修改</button>
            </div>
          </template>

          <!-- 查看模式 -->
          <template v-else>
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 22px">
              <Avatar :name="selected.name" :size="62" ring />
              <div>
                <div style="font-family: var(--font-display); font-size: 1.3rem; font-weight: 600">{{ selected.name }}</div>
                <div class="adm-class-card__meta">{{ selected.title }} · {{ selected.subject }}专业</div>
              </div>
            </div>

            <div class="adm-drawer__stats">
              <div class="adm-drawer__stat">
                <strong>{{ selected.classes }}</strong>
                <span><CalendarDays :size="11" style="vertical-align: -1px" /> 授课班级</span>
              </div>
              <div class="adm-drawer__stat">
                <strong>{{ selected.students }}</strong>
                <span><Users :size="11" style="vertical-align: -1px" /> 在读学生</span>
              </div>
              <div class="adm-drawer__stat">
                <strong>{{ selected.years }}</strong>
                <span><GraduationCap :size="11" style="vertical-align: -1px" /> 教龄(年)</span>
              </div>
            </div>

            <div class="adm-drawer__label">基础信息</div>
            <div class="adm-info-list">
              <div class="adm-info-row"><span>任教学科</span><strong>{{ selected.subject }}</strong></div>
              <div class="adm-info-row"><span>专业职称</span><strong>{{ selected.title }}</strong></div>
              <div v-if="selected.college" class="adm-info-row"><span>所属学院</span><strong>{{ selected.college }}</strong></div>
              <div v-if="selected.degree" class="adm-info-row"><span>学位</span><strong>{{ selected.degree }}</strong></div>
              <div v-if="selected.research" class="adm-info-row"><span>研究方向</span><strong>{{ selected.research }}</strong></div>
              <div class="adm-info-row"><span>当前状态</span><Badge :tone="statusTone[selected.status]">{{ selected.status }}</Badge></div>
              <div class="adm-info-row"><span>工号</span><strong>{{ selected.id.toUpperCase() }}</strong></div>
            </div>
          </template>
        </div>
      </aside>
    </template>

    <!-- 新增教师模态框 -->
    <template v-if="modalOpen">
      <div class="crud-overlay" @click="modalOpen = false" />
      <div class="crud-modal" role="dialog" aria-modal="true" aria-label="新增教师">
        <div class="crud-modal__head">
          <div>
            <h2 class="crud-modal__title">新增教师</h2>
            <div class="crud-modal__sub">录入教师档案与教学工作量</div>
          </div>
          <button class="crud-modal__close" type="button" @click="modalOpen = false">
            <X :size="18" />
          </button>
        </div>
        <div class="crud-modal__body">
          <div class="crud-modal__grid">
            <FormField label="姓名" required>
              <input v-model="form.name" class="form-input" type="text" placeholder="请输入姓名" />
            </FormField>
            <FormField label="学科" required>
              <input v-model="form.subject" class="form-input" type="text" placeholder="如：数学" />
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="职称">
              <select v-model="form.title" class="form-select">
                <option v-for="x in TITLE_OPTIONS" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
            <FormField label="状态">
              <select v-model="form.status" class="form-select">
                <option v-for="x in STATUS_OPTIONS" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="所属学院">
              <select v-model="form.college" class="form-select">
                <option value="">请选择学院</option>
                <option v-for="x in COLLEGES" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
            <FormField label="学位">
              <select v-model="form.degree" class="form-select">
                <option v-for="x in DEGREE_OPTIONS" :key="x" :value="x">{{ x }}</option>
              </select>
            </FormField>
          </div>
          <div class="crud-modal__grid">
            <FormField label="授课班级数">
              <input v-model="form.classes" class="form-input" type="number" min="0" />
            </FormField>
            <FormField label="学生数">
              <input v-model="form.students" class="form-input" type="number" min="0" />
            </FormField>
          </div>
          <FormField label="教龄（年）">
            <input v-model="form.years" class="form-input" type="number" min="0" />
          </FormField>
          <FormField label="研究方向">
            <input v-model="form.research" class="form-input" type="text" placeholder="如：分布式系统" />
          </FormField>
        </div>
        <div class="crud-modal__foot">
          <button class="btn btn-ghost" type="button" @click="modalOpen = false">取消</button>
          <button class="btn btn-primary" type="button" @click="submitAdd">保存</button>
        </div>
      </div>
    </template>

    <ConfirmDialog
      v-if="pendingDelete"
      title="删除教师"
      :message="`确定删除教师「${pendingDelete.name}」吗？此操作不可恢复。`"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />

    <Toast v-if="toast" :message="toast.message" :tone="toast.tone" />
  </div>
</template>
