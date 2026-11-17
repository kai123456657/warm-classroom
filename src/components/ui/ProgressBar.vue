<script setup>
defineProps({
  value: { type: Number, default: 0 },
  color: { type: String, default: 'var(--coral)' },
  height: { type: Number, default: 8 },
  showLabel: { type: Boolean, default: false },
})
</script>

<template>
  <div class="progress-wrap" :style="{ height: height + 'px' }">
    <div
      class="progress-track"
      :style="{ height: height + 'px' }"
      role="progressbar"
      :aria-valuenow="value" aria-valuemin="0" aria-valuemax="100"
    >
      <div class="progress-fill" :style="{ width: Math.min(100, Math.max(0, value)) + '%', background: color }" />
    </div>
    <span v-if="showLabel" class="progress-label">{{ Math.round(value) }}%</span>
  </div>
</template>
