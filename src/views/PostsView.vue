<template>
  <WindowFrame title="posts">
    <NavigationBar @back="goBack" />
    <div class="blank-content">
      <div class="icon-grid">
        <IconItem
            icon="/assets/writenote.png"
            label="write post"
            @click="navigateTo('write-post')"
        />
        <IconItem
            icon="/assets/notepad.png"
            label="all posts"
            @click="navigateTo('all-posts')"
        />
        <IconItem
            icon="/assets/closedfolder.png"
            hoverIcon="/assets/openfolder.png"
            label="posts by group"
            @click="navigateTo('posts-by-group')"
        />
      </div>
    </div>

  </WindowFrame>
</template>

<script>
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import IconItem from '@/components/icons/IconItem.vue'

export default {
  name: 'PostsView',
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

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--grid-gap);
  padding: var(--container-padding);
}
</style>