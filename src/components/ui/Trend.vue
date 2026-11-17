<script setup>
import { computed } from 'vue'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-vue-next'

const props = defineProps({
  value: { type: Number, default: 0 },
  suffix: { type: String, default: '%' },
  showIcon: { type: Boolean, default: true },
})
const cls = computed(() => props.value > 0 ? 'trend--up' : props.value < 0 ? 'trend--down' : 'trend--flat')
const icon = computed(() => props.value > 0 ? ArrowUpRight : props.value < 0 ? ArrowDownRight : Minus)
const text = computed(() => props.value === 0 ? '持平' : `${Math.abs(props.value)}${props.suffix}`)
</script>

<template>
  <span class="trend" :class="cls">
    <component :is="icon" v-if="showIcon" :size="14" :stroke-width="2.5" />{{ text }}
  </span>
</template>
