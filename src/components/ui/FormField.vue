<script setup>
defineProps({
  label: { type: String, required: true },
  hint: String,
  required: Boolean,
})
</script>

<template>
  <label class="form-field">
    <span class="form-field__label">{{ label }}<em v-if="required">*</em></span>
    <slot />
    <span v-if="hint" class="form-field__hint">{{ hint }}</span>
  </label>
</template>
