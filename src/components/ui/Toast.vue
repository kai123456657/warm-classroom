<script setup>
defineProps({
  message: { type: String, required: true },
  tone: { type: String, default: 'success' },
})
</script>

<template>
  <div class="app-toast" :class="`app-toast--${tone}`" role="status">
    <span>{{ tone === 'success' ? '✓' : '!' }}</span>{{ message }}
  </div>
</template>
