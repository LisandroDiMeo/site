<template>
  <WindowFrame title="wishlist">
    <NavigationBar @back="goBack" />
    <div class="wishlist-content">
      <div v-if="loading" class="loading-container">
        <img src="/assets/hourglass.gif" alt="Loading" class="loading-icon">
      </div>

      <div v-else-if="items.length === 0" class="empty-state">
        <p>No items in the wishlist yet.</p>
      </div>

      <div v-else class="wishlist-grid">
        <div v-for="item in items" :key="item.id" class="wishlist-card">
          <div v-if="item.image" class="card-image">
            <img :src="item.image" :alt="item.title">
          </div>
          <div class="card-body">
            <h3 class="card-title">{{ item.title }}</h3>
            <p class="card-description">{{ item.description }}</p>
            <div v-if="item.links && item.links.length > 0" class="card-links">
              <a
                v-for="(link, index) in item.links"
                :key="index"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="link-button"
              >{{ link.name }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </WindowFrame>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'

export default {
  name: 'WishlistView',
  components: {
    WindowFrame,
    NavigationBar
  },
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const items = ref([])

    const goBack = () => {
      router.push({ name: 'home' })
    }

    const loadWishlist = async () => {
      try {
        loading.value = true
        const response = await fetch('/wishlist.json')
        if (!response.ok) {
          throw new Error('Failed to load wishlist')
        }
        items.value = await response.json()
      } catch (error) {
        console.error('Failed to load wishlist:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadWishlist()
    })

    return {
      loading,
      items,
      goBack
    }
  }
}
</script>

<style scoped>
.wishlist-content {
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

.wishlist-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.wishlist-card {
  display: flex;
  flex-direction: row;
  background-color: var(--color-bg-primary);
  border: 2px solid;
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
}

.card-image {
  position: relative;
  width: 150px;
  min-width: 150px;
  padding-top: 150px;
  overflow: hidden;
  border-right: 2px solid;
  border-right-color: var(--border-inset-top);
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-body {
  flex: 1;
  padding: var(--space-4);
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: bold;
  margin-bottom: var(--space-2);
}

.card-description {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-4);
}

.card-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.link-button {
  display: inline-block;
  padding: 2px var(--space-3);
  background-color: var(--color-bg-primary);
  border: 2px solid;
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--color-text-primary);
  text-decoration: none;
  cursor: pointer;
}

.link-button:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.link-button:active {
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
}

@media (max-width: 768px) {
  .wishlist-card {
    flex-direction: column;
  }

  .card-image {
    width: 100%;
    min-width: unset;
    border-right: none;
    border-bottom: 2px solid;
    border-bottom-color: var(--border-inset-top);
  }

  .wishlist-content {
    max-height: calc(100vh - 100px);
  }
}
</style>
