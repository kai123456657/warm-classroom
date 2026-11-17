<script setup>
import { computed } from 'vue'
import { avatarColor, initials } from '@/data/mock'

const props = defineProps({
  name: { type: String, required: true },
  size: { type: Number, default: 40 },
  ring: { type: Boolean, default: false },
})
const color = computed(() => avatarColor(props.name))
</script>

<template>
  <span
    class="avatar"
    :class="{ 'avatar--ring': ring }"
    :style="{ width: size + 'px', height: size + 'px', background: color + '1f', color, fontSize: (size * 0.34) + 'px' }"
    :aria-label="name"
  >{{ initials(name) }}</span>
</template>
