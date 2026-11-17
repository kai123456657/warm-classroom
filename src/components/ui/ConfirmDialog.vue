<script setup>
defineProps({
  title: { type: String, default: '确认删除' },
  message: String,
  confirmText: { type: String, default: '确认删除' },
  cancelText: { type: String, default: '取消' },
  danger: { type: Boolean, default: true },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <div class="confirm-overlay" @click="emit('cancel')">
    <div class="confirm-dialog" role="alertdialog" aria-modal="true" @click.stop>
      <div class="confirm-dialog__icon" :class="{ 'confirm-dialog__icon--danger': danger }">{{ danger ? '!' : '?' }}</div>
      <h3>{{ title }}</h3>
      <p class="muted">{{ message }}</p>
      <div class="confirm-dialog__actions">
        <button class="btn btn-ghost" @click="emit('cancel')">{{ cancelText }}</button>
        <button class="btn" :class="danger ? 'btn-danger' : 'btn-primary'" @click="emit('confirm')">{{ confirmText }}</button>
      </div>
    </div>
  </div>
</template>
