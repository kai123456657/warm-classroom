<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import Topbar from './Topbar.vue'

const route = useRoute()
const router = useRouter()

// 从 localStorage 读取当前角色，默认 teacher
const role = ref(localStorage.getItem('warmclass-role') || 'teacher')
if (!['teacher', 'student', 'admin'].includes(role.value)) role.value = 'teacher'
const collapsed = ref(false)
const mobileOpen = ref(false)

// 路由与角色不一致时纠正
watch(() => route.path, (path) => {
  if (!path.startsWith(`/${role.value}`)) router.replace(`/${role.value}`)
  mobileOpen.value = false
  window.scrollTo({ top: 0, behavior: 'smooth' })
}, { immediate: true })

function switchRole(r) {
  role.value = r
  localStorage.setItem('warmclass-role', r)
}
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--collapsed': collapsed }">
    <!-- 移动端侧边栏 -->
    <div class="sidebar-mobile-wrap" :class="{ open: mobileOpen }">
      <Sidebar :role="role" :collapsed="false" mobile @close-mobile="mobileOpen = false" @switch-role="switchRole" />
    </div>
    <div v-if="mobileOpen" class="mobile-overlay" @click="mobileOpen = false" />

    <!-- 桌面侧边栏 -->
    <Sidebar :role="role" :collapsed="collapsed" @toggle="collapsed = !collapsed" @switch-role="switchRole" />

    <div class="app-main">
      <Topbar :role="role" @menu-click="mobileOpen = true" />
      <main class="app-content">
        <RouterView v-slot="{ Component, route: r }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="r.path" />
          </Transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style>
/* 页面切换过渡（Vue 内置 Transition，替代 framer-motion） */
.page-enter-active, .page-leave-active { transition: opacity .35s var(--ease), transform .35s var(--ease); }
.page-enter-from { opacity: 0; transform: translateY(14px); }
.page-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
