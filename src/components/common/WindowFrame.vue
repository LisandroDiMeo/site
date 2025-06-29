<template>
  <div class="window">
    <div class="window-header">
      <span>{{ title }}</span>
      <button class="close-btn" @click="handleClose">X</button>
    </div>
    <div class="window-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'WindowFrame',
  props: {
    title: {
      type: String,
      default: 'Window'
    }
  },
  methods: {
    handleClose() {
      if (confirm('Are you sure you want to close this window?')) {
        this.$emit('close')
      }
    }
  }
}
</script>

<style scoped>
.window {
  background-color: var(--window-bg);
  border: var(--border-raised);
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
  box-shadow: var(--shadow-small);
  margin: var(--space-6) auto;
  max-width: var(--container-max-width);
}

.window-header {
  background: var(--window-header-bg);
  color: var(--window-header-color);
  padding: var(--window-header-padding);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.window-body {
  padding: var(--window-padding);
  background-color: var(--window-bg);
  min-height: 400px;
}

.close-btn {
  background-color: var(--btn-bg);
  border: var(--border-raised);
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
  padding: 0;
  width: var(--icon-size-sm);
  height: 14px;
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  line-height: 1;
  cursor: pointer;
  transition: var(--transition-fast);
}

.close-btn:active {
  border-top-color: var(--border-raised-bottom);
  border-left-color: var(--border-raised-bottom);
  border-right-color: var(--border-raised-top);
  border-bottom-color: var(--border-raised-top);
}
</style>