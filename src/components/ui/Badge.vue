<script setup>
defineProps({
  tone: { type: String, default: 'coral' },
})
</script>

<template>
  <span class="badge" :class="`badge--${tone}`"><slot /></span>
</template>
