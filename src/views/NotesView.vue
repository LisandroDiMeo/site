<template>
  <WindowFrame title="notes">
    <NavigationBar @back="goBack" />
    
    <div class="icon-grid">
      <IconItem
        icon="/assets/writenote.png"
        label="write note"
        @click="navigateTo('write-note')"
      />
      <IconItem
        icon="/assets/notepad.png"
        label="all notes"
        @click="navigateTo('all-notes')"
      />
      <IconItem
        icon="/assets/closedfolder.png"
        hoverIcon="/assets/openfolder.png"
        label="notes by group"
        @click="navigateTo('notes-by-group')"
      />
    </div>
  </WindowFrame>
</template>

<script>
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import IconItem from '@/components/icons/IconItem.vue'

export default {
  name: 'NotesView',
  components: {
    WindowFrame,
    NavigationBar,
    IconItem
  },
  setup() {
    const router = useRouter()
    
    const goBack = () => {
      router.push({ name: 'home' })
    }
    
    const navigateTo = (route) => {
      router.push({ name: route })
    }
    
    return {
      goBack,
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