import { reactive, readonly, ref } from 'vue'
import { seedData } from '@/data/mock'
import { createRepository } from '@/services/httpRepository'

/**
 * 全局数据 composable（Vue 版对应 React 的 DataContext）
 *
 * 用法（任何组件里）：
 *   import { useData } from '@/composables/useData'
 *   const { classes, addClass, ... } = useData()
 *
 * 设计要点：
 * - 模块级单例 state，所有组件 reactive 共享同一份，无需 Pinia/Vuex
 * - 对外暴露的字段/方法与 React 版完全一致，页面迁移零心智负担
 * - 内部经 Repository 读写，可通过 .env 切换本地/后端
 */

const repo = createRepository()

// 用 reactive 让模板自动响应数据变化
const state = reactive(structuredClone(seedData))
const ready = ref(false)

// 启动时加载，并在首次加载后落盘一次（保证 localStorage 是镜像）
repo.loadAll().then((data) => {
  Object.assign(state, data)
  ready.value = true
  repo.saveSnapshot(data).catch(() => {})
}).catch((e) => {
  console.warn('[useData] 加载失败', e)
  ready.value = true
})

function genId(prefix) {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/**
 * 深拷贝工具：不能用 structuredClone，因为 Vue 的 reactive 是 Proxy 对象，
 * structuredClone 无法克隆 Proxy（会抛 [object Object] could not be cloned）。
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/** 乐观更新 + 异步持久化，失败回滚 */
function commit(key, apply, persist) {
  const snapshot = deepClone(state[key])
  apply(state[key])
  persist().catch((e) => {
    console.warn('[useData] 保存失败，回滚', e)
    state[key] = snapshot
    const message = e instanceof Error ? e.message : '保存失败，请重试'
    window.dispatchEvent(new CustomEvent('data-error', { detail: { message } }))
  })
}

function add(key, item) {
  commit(key, (list) => list.unshift(item), () => repo.create(key, item))
}
function update(key, id, patch) {
  commit(key, (list) => {
    const i = list.findIndex((it) => it.id === id)
    if (i >= 0) Object.assign(list[i], patch)
  }, () => repo.update(key, id, patch))
}
function remove(key, id) {
  commit(key, (list) => {
    const i = list.findIndex((it) => it.id === id)
    if (i >= 0) list.splice(i, 1)
  }, () => repo.remove(key, id))
}

function deleteClass(id) {
  const removedName = state.classes.find((c) => c.id === id)?.name
  const snapshot = {
    classes: deepClone(state.classes),
    students: deepClone(state.students),
    adminCourses: deepClone(state.adminCourses),
    schedule: deepClone(state.schedule),
  }
  // 一次性级联更新多个集合
  state.classes = state.classes.filter((c) => c.id !== id)
  state.students = state.students.filter((s) => s.classId !== id)
  state.adminCourses = state.adminCourses.filter((c) => c.className !== removedName)
  state.schedule = state.schedule.filter((e) => e.classId !== id)

  Promise.all([repo.remove('classes', id), repo.saveSnapshot({
    classes: state.classes, students: state.students,
    adminCourses: state.adminCourses, schedule: state.schedule,
    teachers: state.teachers,
  })]).catch((e) => {
    console.warn('[useData] 级联删除失败，回滚', e)
    Object.assign(state, snapshot)
  })
}

function resetAll() {
  repo.resetAll().then((data) => Object.assign(state, data)).catch((e) => console.warn('[useData] 重置失败', e))
}

// 单例：任何组件调用 useData() 拿到的都是同一份 state 和方法
let instance = null

export function useData() {
  if (instance) return instance
  instance = {
    state,
    ready,
    source: repo.mode,
    get classes() { return state.classes },
    get students() { return state.students },
    get teachers() { return state.teachers },
    get adminCourses() { return state.adminCourses },
    get schedule() { return state.schedule },

    addClass: (c) => add('classes', c),
    updateClass: (id, patch) => update('classes', id, patch),
    deleteClass,
    addStudent: (s) => add('students', s),
    updateStudent: (id, patch) => update('students', id, patch),
    deleteStudent: (id) => remove('students', id),
    addTeacher: (t) => add('teachers', t),
    updateTeacher: (id, patch) => update('teachers', id, patch),
    deleteTeacher: (id) => remove('teachers', id),
    addAdminCourse: (c) => add('adminCourses', c),
    updateAdminCourse: (id, patch) => update('adminCourses', id, patch),
    deleteAdminCourse: (id) => remove('adminCourses', id),
    addSchedule: (e) => add('schedule', e),
    updateSchedule: (id, patch) => update('schedule', id, patch),
    deleteSchedule: (id) => remove('schedule', id),
    resetAll,
    genId,
  }
  return instance
}
