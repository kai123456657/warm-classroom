<script setup>
/**
 * 学生端 · 我的作业
 * 迁移自 React student/Homework.tsx
 * 使用本地 ref 复制 homeworks 模拟状态切换，并给出 Toast 反馈
 */
import { computed, onUnmounted, ref, watch } from 'vue'
import {
  BookOpen, CheckCircle2, ChevronRight, ClipboardList, Clock,
  Inbox, Send, TrendingUp,
} from 'lucide-vue-next'
import { homeworks } from '@/data/mock'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import StatusPill from '@/components/ui/StatusPill.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import '@/styles/student.css'

const tabs = [
  { key: 'all', label: '全部作业' },
  { key: 'pending', label: '待完成' },
  { key: 'submitted', label: '已提交' },
  { key: 'graded', label: '已批改' },
]

const tab = ref('all')
const items = ref(homeworks.map((h) => ({ ...h })))
const toast = ref('')

let toastTimer = null
watch(toast, (value) => {
  if (toastTimer) window.clearTimeout(toastTimer)
  if (!value) return
  toastTimer = window.setTimeout(() => { toast.value = '' }, 2600)
})
onUnmounted(() => { if (toastTimer) window.clearTimeout(toastTimer) })

const counts = computed(() => ({
  all: items.value.length,
  pending: items.value.filter((h) => h.status === 'pending').length,
  submitted: items.value.filter((h) => h.status === 'submitted').length,
  graded: items.value.filter((h) => h.status === 'graded').length,
}))
const doneCount = computed(() => counts.value.submitted + counts.value.graded)
const rate = computed(() =>
  items.value.length ? Math.round((doneCount.value / items.value.length) * 100) : 0,
)
const visible = computed(() =>
  tab.value === 'all' ? items.value : items.value.filter((h) => h.status === tab.value),
)

function complete(id) {
  items.value = items.value.map((h) => (h.id === id ? { ...h, status: 'submitted' } : h))
  toast.value = '提交成功！老师会尽快为你批改～'
}
</script>

<template>
  <div class="stu-page">
    <div>
      <SectionTitle eyebrow="HOMEWORK · 我的作业" title="我的作业" desc="按时完成作业，扎实专业基础">
        <template #action>
          <span class="stu-hw-more">作业清单 <ChevronRight :size="15" /></span>
        </template>
      </SectionTitle>
    </div>

    <div class="stu-hw-summary">
      <div><span class="stu-hw-summary__icon stu-hw-summary__icon--coral"><ClipboardList :size="18" /></span><span>全部作业</span><strong class="display">{{ counts.all }}</strong></div>
      <div><span class="stu-hw-summary__icon stu-hw-summary__icon--butter"><Clock :size="18" /></span><span>待完成</span><strong class="display">{{ counts.pending }}</strong></div>
      <div><span class="stu-hw-summary__icon stu-hw-summary__icon--mint"><CheckCircle2 :size="18" /></span><span>已完成</span><strong class="display">{{ doneCount }}</strong></div>
      <div><span class="stu-hw-summary__icon stu-hw-summary__icon--sky"><TrendingUp :size="18" /></span><span>完成率</span><strong class="display">{{ rate }}%</strong></div>
    </div>

    <div class="stu-tabs" role="tablist">
      <button
        v-for="t in tabs"
        :key="t.key"
        role="tab"
        :aria-selected="tab === t.key"
        :class="tab === t.key ? 'active' : ''"
        @click="tab = t.key"
      >
        {{ t.label }}<span class="stu-tabs__count">{{ counts[t.key] }}</span>
      </button>
    </div>

    <div class="stu-hw-list">
      <div v-if="visible.length === 0" class="card">
        <EmptyState title="这里空空如也" desc="当前状态下暂时没有作业，去别处看看吧">
          <template #icon><Inbox :size="40" /></template>
        </EmptyState>
      </div>
      <template v-else>
      <div v-for="h in visible" :key="h.id" class="card stu-hw">
        <span class="stu-hw__bar" :style="{ background: h.color }" />
        <span class="stu-hw__icon" :style="{ background: `${h.color}1f`, color: h.color }">
          <BookOpen :size="20" :stroke-width="2" />
        </span>
        <div class="stu-hw__main">
          <div class="stu-hw__title-row">
            <strong>{{ h.title }}</strong>
            <StatusPill :status="h.status" />
          </div>
          <div class="stu-hw__sub">
            <span><BookOpen :size="13" /> {{ h.subject }}</span>
            <span><Clock :size="13" /> 截止 {{ h.dueDate }}</span>
          </div>
        </div>
        <div class="stu-hw__right">
          <template v-if="h.status === 'graded'">
            <div class="stu-hw__score display">{{ h.score }}<small>分</small></div>
            <span class="stu-hw__hint">已批改</span>
          </template>
          <span v-else-if="h.status === 'submitted'" class="stu-hw__waiting"><Clock :size="14" /> 等待批改</span>
          <button v-else class="btn btn-primary" @click="complete(h.id)">
            <Send :size="14" /> 去完成
          </button>
        </div>
      </div>
      </template>
    </div>

    <div class="stu-hw-tip">
      <CheckCircle2 :size="17" />
      小提示：点击「去完成」即可模拟提交作业，状态会实时更新。
    </div>

    <div v-if="toast" class="stu-toast">
      <CheckCircle2 :size="18" /> {{ toast }}
    </div>
  </div>
</template>
