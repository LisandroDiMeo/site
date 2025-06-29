<template>
  <WindowFrame title="about me">
    <NavigationBar @back="goBack" />
    <div class="about-content">
      <h2>About Me</h2>
      <p>Hello! I'm Lisandro. I'm just a regular person.</p>
      
      <div class="about-icon">
        <img src="/assets/person_doc.png" alt="About me icon">
      </div>
    </div>
  </WindowFrame>
</template>

<script>
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'

export default {
  name: 'AboutView',
  components: {
    WindowFrame,
    NavigationBar
  },
  setup() {
    const router = useRouter()
    
    const goBack = () => {
      router.push({ name: 'home' })
    }
    
    return {
      goBack
    }
  }
}
</script>

<style scoped>
.about-content {
  padding: var(--space-5);
  background-color: var(--color-bg-secondary);
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
  margin-top: var(--space-5);
}

h2 {
  font-size: var(--font-size-md);
  margin-bottom: var(--space-4);
}

p {
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-5);
}

.about-icon {
  text-align: center;
  margin-top: var(--space-7);
}

.about-icon img {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
}
</style>