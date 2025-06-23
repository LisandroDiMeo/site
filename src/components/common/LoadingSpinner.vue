<template>
  <div class="loading-container">
    <img src="/assets/hourglass.gif" alt="Loading" class="loading-icon">
    <span v-if="message" class="loading-message">{{ message }}</span>
  </div>
</template>

<script>
export default {
  name: 'LoadingSpinner',
  props: {
    message: {
      type: String,
      default: ''
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  gap: 12px;
}

.loading-icon {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.loading-message {
  font-size: 11px;
  color: #000;
}
</style>