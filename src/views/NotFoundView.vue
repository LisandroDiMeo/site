<template>
  <WindowFrame title="Error">
    <div class="error-content">
      <div class="error-header">
        <img src="/assets/monitor_tweak.png" alt="Error" class="error-icon">
        <span class="error-code">404</span>
      </div>
      <p class="error-message">Page not found.</p>
      <p class="error-detail">The address <code>{{ $route.path }}</code> does not exist.</p>
      <button class="error-btn" @click="$router.push('/')">← Go Home</button>
    </div>
  </WindowFrame>
</template>

<script>
import WindowFrame from '@/components/common/WindowFrame.vue'
export default {
  name: 'NotFoundView',
  components: { WindowFrame }
}
</script>

<style scoped>
.error-content {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  align-items: flex-start;
}

.error-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.error-icon {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}

.error-code {
  font-size: var(--font-size-2xl);
  font-weight: bold;
  color: var(--color-error);
}

.error-message {
  font-size: var(--font-size-base);
  font-weight: bold;
}

.error-detail {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.error-detail code {
  background: var(--color-bg-secondary);
  padding: 0 var(--space-2);
  border: var(--border-inset);
}

.error-btn {
  font-family: inherit;
  font-size: var(--font-size-sm);
  background: var(--color-bg-primary);
  border: var(--border-raised);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
}

.error-btn:active {
  border: var(--border-inset);
}
</style>
