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
  background-color: #c0c0c0;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-right-color: #000;
  border-bottom-color: #000;
  padding: 4px 12px;
  font-size: 11px;
  font-family: "MS Sans Serif", Arial, sans-serif;
  cursor: pointer;
  outline: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.btn:active:not(:disabled) {
  border-top-color: #000;
  border-left-color: #000;
  border-right-color: #fff;
  border-bottom-color: #fff;
}

.btn:focus {
  outline: 1px dotted #000;
  outline-offset: -4px;
}

.btn:disabled {
  color: #808080;
  cursor: not-allowed;
}
</style>