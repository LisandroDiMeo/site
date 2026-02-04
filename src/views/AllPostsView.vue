<template>
  <WindowFrame title="all posts">
    <NavigationBar @back="goBack" />
    
    <div v-if="loading" class="loading-header">
      <img src="/assets/hourglass.gif" alt="Loading" class="loading-icon">
    </div>
    
    <h3>All Posts</h3>
    
    <PostsList 
      :posts="posts"
      :loading="loading"
      :show-actions="true"
      :show-pagination="true"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </WindowFrame>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePostsStore } from '@/stores/posts'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import PostsList from '@/components/posts/PostsList.vue'

export default {
  name: 'AllPostsView',
  components: {
    WindowFrame,
    NavigationBar,
    PostsList
  },
  setup() {
    const router = useRouter()
    const postsStore = usePostsStore()
    const loading = ref(true)
    
    const posts = ref([])
    
    onMounted(async () => {
      loading.value = true
      // Simulate loading delay to show hourglass
      setTimeout(async () => {
        await postsStore.fetchPosts()
        posts.value = postsStore.posts
        loading.value = false
      }, 1000)
    })
    
    const goBack = () => {
      router.push({ name: 'posts' })
    }
    
    const handleEdit = (postId) => {
      // TODO: Implement edit functionality
      console.log('Edit post:', postId)
    }
    
    const handleDelete = async (postId) => {
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          await postsStore.deletePost(postId)
          posts.value = postsStore.posts
        } catch (error) {
          alert('Error deleting post')
        }
      }
    }
    
    return {
      posts,
      loading,
      goBack,
      handleEdit,
      handleDelete
    }
  }
}
</script>

<style scoped>
.loading-header {
  position: absolute;
  top: var(--space-8);
  right: var(--space-6);
}

.loading-icon {
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  image-rendering: pixelated;
}

h3 {
  font-size: var(--font-size-md);
  margin: var(--space-5) 0;
  font-weight: var(--font-weight-bold);
}
</style>