<template>
  <WindowFrame title="Lisandro's Files">
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
</style>