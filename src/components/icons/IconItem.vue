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
  padding: 8px;
  border: 1px solid transparent;
  user-select: none;
}

.icon-item:hover {
  background-color: #000080;
  color: #fff;
  border: 1px dotted #fff;
}

.icon-item:active {
  background-color: #000080;
  color: #fff;
}

.icon-image {
  width: 32px;
  height: 32px;
  margin-bottom: 4px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.icon-label {
  font-size: 11px;
  word-break: break-word;
  max-width: 64px;
}
</style>