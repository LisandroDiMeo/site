<template>
  <WindowFrame title="notes by group">
    <NavigationBar @back="goBack" />
    <div class="blank-content">
      <h2>Notes by Group</h2>
      <p>This page is under construction.</p>
      <div class="construction-icon">
        <img src="/assets/closedfolder.png" alt="Under construction">
      </div>
    </div>
  </WindowFrame>
</template>

<script>
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'

export default {
  name: 'NotesByGroupView',
  components: {
    WindowFrame,
    NavigationBar
  },
  setup() {
    const router = useRouter()
    
    const goBack = () => {
      router.push({ name: 'notes' })
    }
    
    return {
      goBack
    }
  }
}
</script>

<style scoped>
.blank-content {
  padding: 16px;
  background-color: #fff;
  border: 1px inset #000;
  margin-top: 16px;
  text-align: center;
}

h2 {
  font-size: 14px;
  margin-bottom: 12px;
}

p {
  margin-bottom: 24px;
  color: #666;
}

.construction-icon {
  margin-top: 24px;
}

.construction-icon img {
  width: 48px;
  height: 48px;
  opacity: 0.5;
  image-rendering: pixelated;
}
</style>