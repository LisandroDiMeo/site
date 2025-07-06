<template>
  <WindowFrame title="Lisandro's Files">
    <div class="blank-content">
    <div class="icon-grid">
      <IconItem
        icon="/assets/closedfolder.png"
        hoverIcon="/assets/openfolder.png"
        label="notes"
        @click="navigateTo('notes')"
      />
      <IconItem
        icon="/assets/closedfolder.png"
        hoverIcon="/assets/openfolder.png"
        label="photos"
        @click="navigateTo('photos')"
      />
      <IconItem
        icon="/assets/person_doc.png"
        label="about me"
        @click="navigateTo('about')"
      />
    </div>
    </div>
  </WindowFrame>
</template>

<script>
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import IconItem from '@/components/icons/IconItem.vue'

export default {
  name: 'HomeView',
  components: {
    WindowFrame,
    IconItem
  },
  setup() {
    const router = useRouter()
    
    const navigateTo = (route) => {
      router.push({ name: route })
    }
    
    return {
      navigateTo
    }
  }
}
</script>

<style scoped>
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--grid-gap);
  padding: var(--container-padding);
}

.blank-content {
  padding: var(--space-5);
  background-color: var(--color-bg-secondary);
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
  margin-top: var(--space-5);
}
</style>