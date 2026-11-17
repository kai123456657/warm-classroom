<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Bell, Search, Menu, Sun, ChevronDown } from 'lucide-vue-next'
import Avatar from '@/components/ui/Avatar.vue'

const props = defineProps({ role: { type: String, required: true } })
const emit = defineEmits(['menu-click'])
const route = useRoute()

const USER = {
  teacher: { name: '王明远', role: '教授 · 计算机学院' },
  student: { name: '林知夏', role: '计科 2201 班 · 学生' },
  admin: { name: '陈主任', role: '教务管理员' },
}
const user = computed(() => USER[props.role])
const title = computed(() => route.meta?.title ?? '工作台')
</script>

<template>
  <header class="topbar">
    <div class="topbar__left">
      <button class="topbar__menu" @click="emit('menu-click')" aria-label="打开菜单"><Menu :size="22" /></button>
      <div class="topbar__crumb">
        <span>暖课堂</span><span class="topbar__sep">/</span><strong>{{ title }}</strong>
      </div>
    </div>
    <div class="topbar__right">
      <div class="topbar__search">
        <Search :size="17" />
        <input type="search" placeholder="搜索课程、学生、资源…" aria-label="搜索" />
        <kbd>⌘ K</kbd>
      </div>
      <button class="topbar__icon" aria-label="主题"><Sun :size="19" /></button>
      <button class="topbar__icon topbar__bell" aria-label="通知"><Bell :size="19" /><span class="dot" /></button>
      <div class="topbar__user">
        <Avatar :name="user.name" :size="38" ring />
        <div class="topbar__user-info"><strong>{{ user.name }}</strong><span>{{ user.role }}</span></div>
        <ChevronDown :size="15" class="topbar__chev" />
      </div>
    </div>
  </header>
</template>
