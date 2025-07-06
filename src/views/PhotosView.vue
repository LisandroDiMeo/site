<template>
  <WindowFrame title="photos">
    <NavigationBar @back="goBack" />
    <div class="blank-content">
      <div class="path-navigation">
        <span 
          v-for="(segment, index) in pathSegments" 
          :key="index"
          class="path-segment"
        >
          <span 
            class="path-link" 
            @click="navigateToPath(index)"
          >{{ segment || 'Root' }}</span>
          <span v-if="index < pathSegments.length - 1"> / </span>
        </span>
      </div>

      <div v-if="loading" class="loading-container">
        <img src="/assets/hourglass.gif" alt="Loading" class="loading-icon">
      </div>

      <div v-else class="items-container">
        <!-- Directories -->
        <div v-if="currentDirectories.length > 0" class="directories-section">
          <IconItem
            v-for="directory in currentDirectories"
            :key="directory"
            icon="/assets/closedfolder.png"
            hoverIcon="/assets/openfolder.png"
            :label="directory"
            @click="navigateToDirectory(directory)"
          />
        </div>

        <!-- Photos with Virtual Scrolling -->
        <div v-if="currentPhotos.length > 0" class="photos-grid" ref="photosGrid">
          <PhotoThumbnail
            v-for="photo in currentPhotos"
            :key="`${currentPath}-${photo.name}`"
            :photo="photo"
            :currentPath="currentPath"
            @click="openPhotoModal(photo)"
            @imageLoaded="handleImageLoaded"
          />
        </div>
      </div>

      <!-- Load More Trigger -->
      <div v-if="hasMorePhotos && !loading" ref="loadMoreTrigger" class="load-more-trigger">
        <img src="/assets/hourglass.gif" alt="Loading more..." class="loading-icon">
      </div>

      <!-- Photo Modal -->
      <PhotoModal
        :show="showModal"
        :photos="currentPhotos"
        :currentPhoto="selectedPhoto"
        :currentPath="currentPath"
        @close="closePhotoModal"
        @navigate="navigatePhoto"
      />
    </div>
  </WindowFrame>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import IconItem from "@/components/icons/IconItem.vue"
import PhotoThumbnail from '@/components/photos/PhotoThumbnail.vue'
import PhotoModal from '@/components/photos/PhotoModal.vue'

export default {
  name: 'PhotosView',
  components: {
    IconItem,
    WindowFrame,
    NavigationBar,
    PhotoThumbnail,
    PhotoModal
  },
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const photoStructure = ref(null)
    const currentPath = ref('')
    const showModal = ref(false)
    const selectedPhoto = ref(null)
    const batchSize = 20 // Increased batch size for better performance
    const currentBatch = ref(1)
    const loadMoreTrigger = ref(null)
    const photosGrid = ref(null)
    const loadedImagesCount = ref(0)
    let observer = null
    let loadingMorePhotos = ref(false)

    const pathSegments = computed(() => {
      return currentPath.value.split('/').filter(Boolean)
    })

    const getCurrentNode = () => {
      if (!photoStructure.value) return null
      
      if (!currentPath.value) {
        return photoStructure.value
      }
      
      let node = photoStructure.value
      const segments = currentPath.value.split('/').filter(Boolean)
      
      for (const segment of segments) {
        if (node.children && node.children[segment]) {
          node = node.children[segment]
        } else {
          console.error('Path segment not found:', segment)
          return null
        }
      }
      
      return node
    }

    const currentDirectories = computed(() => {
      const node = getCurrentNode()
      return node ? node.subdirs || [] : []
    })

    const allPhotos = computed(() => {
      const node = getCurrentNode()
      return node ? (node.file_details || []) : []
    })

    const currentPhotos = computed(() => {
      const endIndex = currentBatch.value * batchSize
      return allPhotos.value.slice(0, endIndex)
    })

    const hasMorePhotos = computed(() => {
      return currentPhotos.value.length < allPhotos.value.length
    })

    const loadMorePhotos = () => {
      if (hasMorePhotos.value && !loadingMorePhotos.value) {
        loadingMorePhotos.value = true
        
        // Use requestAnimationFrame for smooth loading
        requestAnimationFrame(() => {
          currentBatch.value++
          loadingMorePhotos.value = false
        })
      }
    }

    const loadPhotoStructure = async () => {
      try {
        loading.value = true
        const response = await fetch('/photo-index.json')

        if (!response.ok) {
          throw new Error('Failed to load photo index')
        }

        photoStructure.value = await response.json()
      } catch (error) {
        console.error('Failed to load photo structure:', error)
      } finally {
        loading.value = false
      }
    }

    const navigateToDirectory = (directory) => {
      // Reset states
      const newPath = currentPath.value ? `/${directory}` : directory
      currentPath.value = newPath
      currentBatch.value = 1
      loadedImagesCount.value = 0
      
      console.log('Navigating to directory:', newPath) // Debug log
      
      // Clean up observer
      if (observer) {
        observer.disconnect()
      }
      
      // Setup observer again after DOM update
      nextTick(() => {
        setupInfiniteScroll()
      })
    }

    const navigateToPath = (index) => {
      const segments = pathSegments.value
      currentPath.value = segments.slice(0, index + 1).join('/')
      currentBatch.value = 1
      loadedImagesCount.value = 0
      
      // Clean up observer
      if (observer) {
        observer.disconnect()
      }
      
      // Setup observer again after DOM update
      nextTick(() => {
        setupInfiniteScroll()
      })
    }

    const goBack = () => {
      if (pathSegments.value.length > 0) {
        const segments = pathSegments.value
        segments.pop()
        currentPath.value = segments.join('/')
      } else {
        router.push({ name: 'home' })
      }
      currentBatch.value = 1
      loadedImagesCount.value = 0
    }

    const openPhotoModal = (photo) => {
      selectedPhoto.value = photo
      showModal.value = true
    }

    const closePhotoModal = () => {
      showModal.value = false
      selectedPhoto.value = null
    }

    const navigatePhoto = (photo) => {
      selectedPhoto.value = photo
    }

    const handleImageLoaded = (photo) => {
      loadedImagesCount.value++
      // Optional: Add progressive loading feedback
    }

    // Simplified intersection observer setup
    const setupInfiniteScroll = () => {
      if (observer) {
        observer.disconnect()
      }

      // Wait for the trigger element to be available
      const checkForTrigger = () => {
        if (loadMoreTrigger.value && hasMorePhotos.value) {
          observer = new IntersectionObserver((entries) => {
            const target = entries[0]
            if (target.isIntersecting && hasMorePhotos.value && !loading.value && !loadingMorePhotos.value) {
              loadMorePhotos()
            }
          }, {
            rootMargin: '200px', // Increased margin for smoother loading
            threshold: 0.1
          })

          observer.observe(loadMoreTrigger.value)
        }
      }

      // Check immediately and then poll if needed
      checkForTrigger()
      
      // Fallback polling with shorter interval
      const pollInterval = setInterval(() => {
        if (loadMoreTrigger.value && hasMorePhotos.value) {
          checkForTrigger()
          clearInterval(pollInterval)
        }
      }, 100)

      // Clear polling after reasonable time
      setTimeout(() => clearInterval(pollInterval), 2000)
    }

    onMounted(async () => {
      await loadPhotoStructure()
      nextTick(() => {
        setupInfiniteScroll()
      })
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }
    })

    return {
      currentPath,
      currentDirectories,
      currentPhotos,
      pathSegments,
      loading,
      showModal,
      selectedPhoto,
      hasMorePhotos,
      loadMoreTrigger,
      photosGrid,
      loadedImagesCount,
      navigateToDirectory,
      navigateToPath,
      goBack,
      openPhotoModal,
      closePhotoModal,
      navigatePhoto,
      loadMorePhotos,
      handleImageLoaded
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

.path-navigation {
  background-color: var(--color-bg-primary);
  padding: var(--space-2) var(--space-4);
  border: var(--border-primary);
  margin-bottom: var(--space-4);
}

.path-segment {
  font-size: var(--font-size-sm);
}

.path-link {
  cursor: pointer;
  color: var(--color-text-link);
}

.path-link:hover {
  text-decoration: underline;
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

.items-container {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-4);
}

.directories-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-4);
  /* Optimize for performance */
  contain: layout style paint;
}

.load-more-trigger {
  width: 100%;
  height: 40px;
  margin-top: var(--space-4);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Add media queries for responsive grid */
@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--space-2);
  }
}
</style>