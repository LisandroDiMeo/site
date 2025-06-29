<template>
  <button 
    class="btn" 
    :type="type"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot></slot>
  </button>
</template>

<script>
export default {
  name: 'Button',
  props: {
    type: {
      type: String,
      default: 'button'
    },
    disabled: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.btn {
  background-color: var(--btn-bg);
  border: var(--border-raised);
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
  padding: var(--btn-padding-y) var(--btn-padding-x);
  font-size: var(--btn-font-size);
  font-family: var(--btn-font-family);
  cursor: pointer;
  outline: none;
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  transition: var(--transition-fast);
}

.btn:active:not(:disabled) {
  border-top-color: var(--border-raised-bottom);
  border-left-color: var(--border-raised-bottom);
  border-right-color: var(--border-raised-top);
  border-bottom-color: var(--border-raised-top);
}

.btn:focus {
  outline: var(--btn-focus-outline);
  outline-offset: var(--btn-focus-offset);
}

.btn:disabled {
  color: var(--color-text-disabled);
  cursor: not-allowed;
}
</style>