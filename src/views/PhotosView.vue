<template>
  <WindowFrame title="photos">
    <NavigationBar @back="goBack" />
    <div class="photo-content-wrapper" ref="scrollContainer" @scroll="handleScroll">
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

        <!-- Photos Grid with Keep-Alive approach -->
        <div v-if="allPhotos.length > 0" class="photos-section">
          <!-- All photos rendered but hidden when not in view -->
          <div class="photos-grid">
            <template v-for="(photo, index) in allPhotos" :key="`${currentPath}-${photo.name}`">
              <div
                  v-show="isPhotoVisible(index)"
                  class="photo-wrapper"
              >
                <PhotoThumbnail
                    :photo="photo"
                    :currentPath="currentPath"
                    :loadImmediately="hasBeenVisible(index)"
                    @click="openPhotoModal(photo)"
                    @imageLoaded="handleImageLoaded"
                />
              </div>
            </template>
          </div>

          <!-- Virtual scroll spacer to maintain scroll height -->
          <div class="scroll-spacer" :style="{ height: totalHeight + 'px' }"></div>
        </div>

        <!-- Cache stats in development -->
        <div v-if="showDebug" class="debug-info">
          Visible: {{ visibleRange.start }}-{{ visibleRange.end }} of {{ allPhotos.length }} |
          Cached: {{ cacheStats.loaded }}/{{ cacheStats.totalCached }} |
          Queue: {{ cacheStats.queueLength }} |
          Active: {{ cacheStats.activeDownloads }}
        </div>
      </div>

      <!-- Photo Modal -->
      <PhotoModal
          :show="showModal"
          :photos="allPhotos"
          :currentPhoto="selectedPhoto"
          :currentPath="currentPath"
          @close="closePhotoModal"
          @navigate="navigatePhoto"
      />
    </div>
  </WindowFrame>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import IconItem from "@/components/icons/IconItem.vue"
import PhotoThumbnail from '@/components/photos/PhotoThumbnail.vue'
import PhotoModal from '@/components/photos/PhotoModal.vue'
import imageCache from '../data/ImageCacheManager.js'

export default {
  name: 'PhotosView',
  components: {
    PhotoThumbnail,
    IconItem,
    WindowFrame,
    NavigationBar,
    PhotoModal
  },
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const photoStructure = ref(null)
    const currentPath = ref('')
    const showModal = ref(false)
    const selectedPhoto = ref(null)
    const scrollContainer = ref(null)
    const loadedImagesCount = ref(0)
    const showDebug = ref(process.env.NODE_ENV === 'development')

    // Track which photos have been visible
    const visiblePhotosSet = ref(new Set())

    // Virtual scrolling state
    const scrollTop = ref(0)
    const containerHeight = ref(600)
    const itemHeight = 150
    const itemsPerRow = ref(5)
    const bufferRows = 2

    // Cache stats
    const cacheStats = ref({
      totalCached: 0,
      loaded: 0,
      loading: 0,
      errors: 0,
      queueLength: 0,
      activeDownloads: 0
    })

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

    // Calculate total height
    const totalRows = computed(() => {
      return Math.ceil(allPhotos.value.length / itemsPerRow.value)
    })

    const totalHeight = computed(() => {
      return totalRows.value * itemHeight
    })

    // Calculate visible range
    const visibleRange = computed(() => {
      const startRow = Math.max(0, Math.floor(scrollTop.value / itemHeight) - bufferRows)
      const endRow = Math.min(
          totalRows.value,
          Math.ceil((scrollTop.value + containerHeight.value) / itemHeight) + bufferRows
      )

      const start = startRow * itemsPerRow.value
      const end = Math.min(allPhotos.value.length, endRow * itemsPerRow.value)

      // Track visible photos
      for (let i = start; i < end; i++) {
        visiblePhotosSet.value.add(i)
      }

      return { start, end, startRow, endRow }
    })

    // Check if photo should be visible
    const isPhotoVisible = (index) => {
      return index >= visibleRange.value.start && index < visibleRange.value.end
    }

    // Check if photo has been visible before
    const hasBeenVisible = (index) => {
      return visiblePhotosSet.value.has(index)
    }

    // Update cache stats periodically
    const updateCacheStats = () => {
      cacheStats.value = imageCache.getStats()
    }

    // Throttled scroll handler
    let scrollRaf = null
    const handleScroll = (event) => {
      if (scrollRaf) cancelAnimationFrame(scrollRaf)

      scrollRaf = requestAnimationFrame(() => {
        scrollTop.value = event.target.scrollTop
        updateCacheStats()
      })
    }

    // Update dimensions
    const updateDimensions = () => {
      if (!scrollContainer.value) return

      containerHeight.value = scrollContainer.value.clientHeight
      const containerWidth = scrollContainer.value.clientWidth - 40 // Account for padding
      const itemWidth = 120 + 16
      itemsPerRow.value = Math.floor(containerWidth / itemWidth) || 1
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
        nextTick(() => updateDimensions())
      }
    }

    const navigateToDirectory = (directory) => {
      // Clear visible photos set when navigating
      visiblePhotosSet.value.clear()

      const newPath = currentPath.value ? `${currentPath.value}/${directory}` : directory
      currentPath.value = newPath
      loadedImagesCount.value = 0

      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0
        scrollTop.value = 0
      }

      // Clear cache for previous directory to free memory
      imageCache.clearAll()
    }

    const navigateToPath = (index) => {
      visiblePhotosSet.value.clear()

      const segments = pathSegments.value
      currentPath.value = segments.slice(0, index + 1).join('/')
      loadedImagesCount.value = 0

      if (scrollContainer.value) {
        scrollContainer.value.scrollTop = 0
        scrollTop.value = 0
      }

      imageCache.clearAll()
    }

    const goBack = () => {
      if (pathSegments.value.length > 0) {
        visiblePhotosSet.value.clear()

        const segments = pathSegments.value
        segments.pop()
        currentPath.value = segments.join('/')
        loadedImagesCount.value = 0

        if (scrollContainer.value) {
          scrollContainer.value.scrollTop = 0
          scrollTop.value = 0
        }

        imageCache.clearAll()
      } else {
        router.push({ name: 'home' })
      }
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
      updateCacheStats()
    }

    // Setup resize observer
    let resizeObserver = null
    const setupResizeObserver = () => {
      if (!scrollContainer.value) return

      resizeObserver = new ResizeObserver(() => {
        updateDimensions()
      })

      resizeObserver.observe(scrollContainer.value)
    }

    // Update cache stats periodically
    let statsInterval = null

    onMounted(async () => {
      await loadPhotoStructure()

      nextTick(() => {
        updateDimensions()
        setupResizeObserver()

        // Update cache stats every second in debug mode
        if (showDebug.value) {
          statsInterval = setInterval(updateCacheStats, 1000)
        }
      })
    })

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (scrollRaf) {
        cancelAnimationFrame(scrollRaf)
      }
      if (statsInterval) {
        clearInterval(statsInterval)
      }

      // Clear cache when component unmounts
      imageCache.clearAll()
    })

    return {
      currentPath,
      currentDirectories,
      allPhotos,
      pathSegments,
      loading,
      showModal,
      selectedPhoto,
      scrollContainer,
      loadedImagesCount,
      totalHeight,
      visibleRange,
      showDebug,
      cacheStats,
      visiblePhotosSet,
      isPhotoVisible,
      hasBeenVisible,
      navigateToDirectory,
      navigateToPath,
      goBack,
      openPhotoModal,
      closePhotoModal,
      navigatePhoto,
      handleImageLoaded,
      handleScroll
    }
  }
}
</script>

<style scoped>
.photo-content-wrapper {
  background-color: var(--color-bg-secondary);
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
  margin-top: var(--space-5);
  height: calc(100vh - 120px);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
  scroll-behavior: smooth;
}

.path-navigation {
  background-color: var(--color-bg-primary);
  padding: var(--space-2) var(--space-4);
  border: var(--border-raised);
  margin: var(--space-5) var(--space-5) var(--space-4) var(--space-5);
  position: sticky;
  top: var(--space-5);
  z-index: 10;
}

.path-segment {
  font-size: var(--font-size-sm);
}

.path-link {
  cursor: pointer;
  color: var(--color-info);
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
  padding: 0 var(--space-5) var(--space-5) var(--space-5);
}

.directories-section {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.photos-section {
  position: relative;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-4);
  position: relative;
  z-index: 1;
}

.photo-wrapper {
  display: contents; /* Makes the wrapper not affect grid layout */
}

.scroll-spacer {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  z-index: 0;
  pointer-events: none;
}

.debug-info {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  font-size: 11px;
  font-family: monospace;
  border-radius: 4px;
  z-index: 1000;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: var(--space-2);
  }

  .photo-content-wrapper {
    height: calc(100vh - 100px);
  }
}
</style>