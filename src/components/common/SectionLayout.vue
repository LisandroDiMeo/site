<template>
  <WindowFrame :title="title">
    <NavigationBar @back="goBack" />
    <div class="section-content">
      <div v-if="loading" class="loading-container">
        <img src="/assets/hourglass.gif" alt="Loading" class="loading-icon">
      </div>

      <div v-else-if="empty" class="empty-state">
        <slot name="empty">
          <p>No items yet.</p>
        </slot>
      </div>

      <slot v-else></slot>
    </div>
  </WindowFrame>
</template>

<script>
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'

export default {
  name: 'SectionLayout',
  components: {
    WindowFrame,
    NavigationBar
  },
  props: {
    title: {
      type: String,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    },
    empty: {
      type: Boolean,
      default: false
    }
  },
  setup() {
    const router = useRouter()

    const goBack = () => {
      router.push({ name: 'home' })
    }

    return { goBack }
  }
}
</script>

<style scoped>
.section-content {
  padding: var(--space-5);
  background-color: var(--color-bg-secondary);
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
  margin-top: var(--space-5);
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.loading-icon {
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  image-rendering: pixelated;
}

.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .section-content {
    max-height: calc(100vh - 100px);
  }
}
</style>
