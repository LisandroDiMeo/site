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
  padding: 16px;
  background-color: #fff;
  border: 1px inset #000;
  margin-top: 16px;
}

h2 {
  font-size: 14px;
  margin-bottom: 12px;
}

p {
  line-height: 1.6;
  margin-bottom: 16px;
}

.about-icon {
  text-align: center;
  margin-top: 24px;
}

.about-icon img {
  width: 64px;
  height: 64px;
  image-rendering: pixelated;
}
</style>