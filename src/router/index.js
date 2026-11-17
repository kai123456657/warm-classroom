import { createRouter, createWebHashHistory } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'

// 三端页面
import TeacherDashboard from '@/pages/teacher/Dashboard.vue'
import PptGenerator from '@/pages/teacher/PptGenerator.vue'
import Schedule from '@/pages/teacher/Schedule.vue'
import Analytics from '@/pages/teacher/Analytics.vue'
import Grades from '@/pages/teacher/Grades.vue'

import StudentDashboard from '@/pages/student/Dashboard.vue'
import MyCourses from '@/pages/student/MyCourses.vue'
import HomeworkPage from '@/pages/student/Homework.vue'
import LearningReport from '@/pages/student/LearningReport.vue'
import MyGrades from '@/pages/student/MyGrades.vue'

import AdminDashboard from '@/pages/admin/Dashboard.vue'
import ClassManage from '@/pages/admin/ClassManage.vue'
import TeacherManage from '@/pages/admin/TeacherManage.vue'
import CourseManage from '@/pages/admin/CourseManage.vue'

/**
 * 路由结构：用一个无路径的父路由承载 AppShell（布局），
 * 子路由用完整的 /teacher /student /admin 路径。
 * 这样 AppShell 在所有页面共享，且 URL 干净。
 */
const routes = [
  {
    path: '/',
    component: AppShell,
    children: [
      { path: '', redirect: '/teacher' },
      // 教师端
      { path: 'teacher', name: 'teacher', component: TeacherDashboard, meta: { title: '教学概览', role: 'teacher' } },
      { path: 'teacher/ppt', name: 'ppt', component: PptGenerator, meta: { title: '智能生成 PPT', role: 'teacher' } },
      { path: 'teacher/schedule', name: 'schedule', component: Schedule, meta: { title: '课程安排', role: 'teacher' } },
      { path: 'teacher/analytics', name: 'analytics', component: Analytics, meta: { title: '学生学情', role: 'teacher' } },
      { path: 'teacher/grades', name: 'grades', component: Grades, meta: { title: '成绩分析', role: 'teacher' } },
      // 学生端
      { path: 'student', name: 'student', component: StudentDashboard, meta: { title: '学习概览', role: 'student' } },
      { path: 'student/courses', name: 'my-courses', component: MyCourses, meta: { title: '我的课程', role: 'student' } },
      { path: 'student/homework', name: 'homework', component: HomeworkPage, meta: { title: '我的作业', role: 'student' } },
      { path: 'student/report', name: 'report', component: LearningReport, meta: { title: '学情报告', role: 'student' } },
      { path: 'student/grades', name: 'my-grades', component: MyGrades, meta: { title: '我的成绩', role: 'student' } },
      // 管理端
      { path: 'admin', name: 'admin', component: AdminDashboard, meta: { title: '数据总览', role: 'admin' } },
      { path: 'admin/classes', name: 'classes', component: ClassManage, meta: { title: '班级管理', role: 'admin' } },
      { path: 'admin/teachers', name: 'teachers', component: TeacherManage, meta: { title: '教师管理', role: 'admin' } },
      { path: 'admin/courses', name: 'courses', component: CourseManage, meta: { title: '课程管理', role: 'admin' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/teacher' },
]

const router = createRouter({
  // hash 模式：静态托管（GitHub Pages 等）无需服务器回退配置，刷新/直达链接均可用
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
