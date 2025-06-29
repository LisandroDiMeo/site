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
  padding: var(--space-6);
  gap: var(--space-4);
}

.loading-icon {
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.loading-message {
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}
</style>