<script setup>
defineProps({
  eyebrow: String,
  title: { type: String, required: true },
  desc: String,
})
</script>

<template>
  <div class="section-title">
    <div>
      <div v-if="eyebrow" class="eyebrow">{{ eyebrow }}</div>
      <h2 class="display section-title__h">{{ title }}</h2>
      <p v-if="desc" class="section-title__desc muted">{{ desc }}</p>
    </div>
    <div v-if="$slots.action" class="section-title__action"><slot name="action" /></div>
  </div>
</template>
