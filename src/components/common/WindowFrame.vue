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
  background-color: #c0c0c0;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-right-color: #000;
  border-bottom-color: #000;
  box-shadow: 1px 1px 0 #000;
  margin: 20px auto;
  max-width: 800px;
}

.window-header {
  background: linear-gradient(to right, #000080, #1084d0);
  color: #fff;
  padding: 2px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  font-size: 11px;
}

.window-body {
  padding: 8px;
  background-color: #c0c0c0;
  min-height: 400px;
}

.close-btn {
  background-color: #c0c0c0;
  border: 2px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-right-color: #000;
  border-bottom-color: #000;
  padding: 0;
  width: 16px;
  height: 14px;
  font-size: 10px;
  font-weight: bold;
  line-height: 1;
  cursor: pointer;
}

.close-btn:active {
  border-top-color: #000;
  border-left-color: #000;
  border-right-color: #fff;
  border-bottom-color: #fff;
}
</style>