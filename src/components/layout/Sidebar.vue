<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  LayoutDashboard, Presentation, ChartNoAxesCombined, CalendarDays,
  BookOpen, ClipboardList, BarChart3, School, Users, LifeBuoy,
  Sparkles, ChevronLeft,
} from 'lucide-vue-next'
import { useData } from '@/composables/useData'

const props = defineProps({
  role: { type: String, required: true },
  collapsed: { type: Boolean, default: false },
  mobile: { type: Boolean, default: false },
})
const emit = defineEmits(['toggle', 'switch-role', 'close-mobile'])

const route = useRoute()
const router = useRouter()
const data = useData()

const ICONS = {
  LayoutDashboard, Presentation, ChartNoAxesCombined, CalendarDays,
  BookOpen, ClipboardList, BarChart3, School, Users,
}

const NAV = {
  teacher: [
    { label: '工作台', items: [
      { key: 'dashboard', label: '教学概览', path: '/teacher', icon: 'LayoutDashboard' },
    ]},
    { label: '教学工具', items: [
      { key: 'ppt', label: '智能生成 PPT', path: '/teacher/ppt', icon: 'Presentation', badge: 'AI' },
      { key: 'schedule', label: '课程安排', path: '/teacher/schedule', icon: 'CalendarDays' },
    ]},
    { label: '数据洞察', items: [
      { key: 'analytics', label: '学生学情', path: '/teacher/analytics', icon: 'ChartNoAxesCombined' },
      { key: 'grades', label: '成绩分析', path: '/teacher/grades', icon: 'BarChart3' },
    ]},
  ],
  student: [
    { label: '学习空间', items: [
      { key: 'dashboard', label: '学习概览', path: '/student', icon: 'LayoutDashboard' },
      { key: 'courses', label: '我的课程', path: '/student/courses', icon: 'BookOpen' },
      { key: 'homework', label: '我的作业', path: '/student/homework', icon: 'ClipboardList', badge: '2' },
    ]},
    { label: '成长记录', items: [
      { key: 'report', label: '学情报告', path: '/student/report', icon: 'ChartNoAxesCombined' },
      { key: 'grades', label: '我的成绩', path: '/student/grades', icon: 'BarChart3' },
    ]},
  ],
  admin: [
    { label: '管理中枢', items: [
      { key: 'dashboard', label: '数据总览', path: '/admin', icon: 'LayoutDashboard' },
    ]},
    { label: '资源管理', items: [
      { key: 'classes', label: '班级管理', path: '/admin/classes', icon: 'School' },
      { key: 'teachers', label: '教师管理', path: '/admin/teachers', icon: 'Users' },
      { key: 'courses', label: '课程管理', path: '/admin/courses', icon: 'BookOpen' },
    ]},
  ],
}

const META = {
  teacher: { name: '教师工作台', sub: 'TEACHER SPACE' },
  student: { name: '学习空间', sub: 'STUDENT SPACE' },
  admin: { name: '管理中心', sub: 'ADMIN CONSOLE' },
}
const meta = computed(() => META[props.role])
const sections = computed(() => NAV[props.role])

function go(path) {
  router.push(path)
  if (props.mobile) emit('close-mobile')
}
function switchRole(r) {
  emit('switch-role', r)
  router.push(`/${r}`)
  if (props.mobile) emit('close-mobile')
}
const isActive = (path) => route.path === path
</script>

<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed && !mobile }">
    <div class="sidebar__brand">
      <div class="brand-mark"><Sparkles :size="20" :stroke-width="2.4" /></div>
      <div v-if="!collapsed || mobile" class="brand-text">
        <strong>暖课堂</strong><span>WARM CLASSROOM</span>
      </div>
      <button v-if="!mobile" class="sidebar__collapse" @click="emit('toggle')" aria-label="收起/展开">
        <ChevronLeft :size="18" :class="{ flip: collapsed }" />
      </button>
      <button v-else class="sidebar__collapse" @click="emit('close-mobile')" aria-label="关闭">✕</button>
    </div>

    <div v-if="!collapsed || mobile" class="sidebar__role">
      <span class="sidebar__role-label">{{ meta.sub }}</span>
      <strong>{{ meta.name }}</strong>
    </div>

    <nav class="sidebar__nav" aria-label="主导航">
      <div v-for="section in sections" :key="section.label" class="nav-section">
        <div v-if="!collapsed || mobile" class="nav-section__label">{{ section.label }}</div>
        <a
          v-for="item in section.items" :key="item.key"
          href="javascript:void(0)"
          class="nav-item"
          :class="{ 'nav-item--active': isActive(item.path) }"
          :title="collapsed && !mobile ? item.label : undefined"
          @click="go(item.path)"
        >
          <component :is="ICONS[item.icon]" :size="19" :stroke-width="2" class="nav-item__icon" />
          <span v-if="!collapsed || mobile" class="nav-item__label">{{ item.label }}</span>
          <span v-if="(!collapsed || mobile) && item.badge" class="nav-item__badge">{{ item.badge }}</span>
        </a>
      </div>
    </nav>

    <div class="sidebar__bottom">
      <div v-if="!collapsed || mobile" class="role-switcher">
        <div class="role-switcher__label">切换身份预览</div>
        <div class="role-switcher__btns">
          <button
            v-for="r in ['teacher','student','admin']" :key="r"
            :class="{ active: r === role }"
            :title="{ teacher: '教师', student: '学生', admin: '管理员' }[r]"
            @click="switchRole(r)"
          >{{ { teacher: '师', student: '生', admin: '管' }[r] }}</button>
        </div>
      </div>
      <button class="sidebar__help" title="帮助中心">
        <LifeBuoy :size="19" /><span v-if="!collapsed || mobile">帮助与支持</span>
      </button>
      <div class="sidebar__version">
        <template v-if="!collapsed || mobile">
          <span class="ds-badge" :class="`ds-badge--${data.source}`" :title="data.source === 'http' ? '已连接 Flask 后端' : '本地演示数据（localStorage）'">
            <i />{{ data.source === 'http' ? '后端已连接' : '本地演示' }}
          </span> · v1.0
        </template>
      </div>
    </div>
  </aside>
</template>
