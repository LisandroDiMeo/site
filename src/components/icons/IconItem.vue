<template>
  <div class="icon-item" @click="handleClick" @dblclick="handleDoubleClick" @mouseover="isHovered = true" @mouseleave="isHovered = false">
    <img 
      :src="isHovered && hoverIcon != '' ? hoverIcon : icon"
      :alt="label" 
      class="icon-image">
    <span class="icon-label">{{ label }}</span>
  </div>
</template>

<script>
export default {
  name: 'IconItem',
  props: {
    icon: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    doubleClick: {
      type: Boolean,
      default: false
    },
    hoverIcon: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isHovered: false
    }
  },
  methods: {
    handleClick() {
      if (!this.doubleClick) {
        this.$emit('click')
      }
    },
    handleDoubleClick() {
      if (this.doubleClick) {
        this.$emit('click')
      }
    }
  }
}
</script>

<style scoped>
.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-align: center;
  padding: var(--space-3);
  border: var(--border-width-thin) solid transparent;
  user-select: none;
  transition: var(--transition-fast);
}

.icon-item:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: var(--border-width-thin) dotted var(--color-text-inverse);
}

.icon-item:active {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.icon-image {
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  margin-bottom: var(--space-2);
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.icon-label {
  font-size: var(--font-size-sm);
  word-break: break-word;
  max-width: 64px;
}
</style>