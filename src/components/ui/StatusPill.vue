<script setup>
import { computed } from 'vue'
const props = defineProps({ status: { type: String, required: true } })

const map = {
  excellent: { label: '优秀', cls: 'mint' },
  good: { label: '良好', cls: 'sky' },
  warning: { label: '关注', cls: 'butter' },
  risk: { label: '预警', cls: 'coral' },
  pending: { label: '待完成', cls: 'coral' },
  submitted: { label: '已提交', cls: 'sky' },
  graded: { label: '已批改', cls: 'mint' },
}
const conf = computed(() => map[props.status] ?? { label: props.status, cls: 'sky' })
</script>

<template>
  <span class="pill" :class="`pill--${conf.cls}`"><i />{{ conf.label }}</span>
</template>
