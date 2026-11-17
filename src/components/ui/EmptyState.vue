<script setup>
defineProps({ title: String, desc: String })
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon"><slot name="icon" /></div>
    <h3>{{ title }}</h3>
    <p v-if="desc" class="muted">{{ desc }}</p>
  </div>
</template>
