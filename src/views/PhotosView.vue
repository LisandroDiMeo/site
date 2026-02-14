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
        <button
            v-if="hasErrors"
            class="reload-button"
            @click="reloadFailedPhotos"
            title="Reload failed photos"
        >
          Reload ({{ errorCount }})
        </button>
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

        <!-- Photos Grid with Smooth Virtual Scrolling -->
        <div v-if="allPhotos.length > 0" class="photos-virtual-container">
          <!-- Top spacer for virtual scrolling -->
          <div class="virtual-spacer-top" :style="{ height: spacerTop + 'px' }"></div>

          <!-- Visible photos grid -->
          <div class="photos-grid">
            <PhotoThumbnail
                v-for="(photo, index) in visiblePhotos"
                :key="`${currentPath}-${photo.name}-${startIndex + index}`"
                :photo="photo"
                :currentPath="currentPath"
                :loadImmediately="true"
                @click="openPhotoModal(photo)"
                @imageLoaded="handleImageLoaded"
            />
          </div>

          <!-- Bottom spacer for virtual scrolling -->
          <div class="virtual-spacer-bottom" :style="{ height: spacerBottom + 'px' }"></div>
        </div>

        <!-- Cache stats in development -->
        <div v-if="showDebug" class="debug-info">
          Visible: {{ visibleRange.start }}-{{ visibleRange.end }} of {{ allPhotos.length }} |
          Cached: {{ cacheStats.loaded }}/{{ cacheStats.totalCached }} |
          Queue: {{ cacheStats.queueLength }} |
          Active: {{ cacheStats.activeDownloads }} |
          Scroll: {{ Math.round(scrollTop) }}px
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

    // Virtual scrolling state
    const scrollTop = ref(0)
    const containerHeight = ref(600)
    const rowHeight = 156 // Height per row (140px item + 16px gap)
    const itemsPerRow = ref(5)
    const bufferRows = 3 // Extra rows to render above/below viewport

    // Smooth scroll handling
    let lastScrollTop = 0
    let scrollVelocity = 0
    let scrollAnimationFrame = null

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
      return totalRows.value * rowHeight
    })

    // Calculate visible range with smooth transitions
    const visibleRange = computed(() => {
      const scrollY = Math.max(0, scrollTop.value)
      const startRow = Math.max(0, Math.floor(scrollY / rowHeight) - bufferRows)
      const endRow = Math.min(
          totalRows.value,
          Math.ceil((scrollY + containerHeight.value) / rowHeight) + bufferRows
      )

      const start = startRow * itemsPerRow.value
      const end = Math.min(allPhotos.value.length, endRow * itemsPerRow.value)

      return { start, end, startRow, endRow }
    })

    // Computed for visible photos slice
    const startIndex = computed(() => visibleRange.value.start)
    const endIndex = computed(() => visibleRange.value.end)

    const visiblePhotos = computed(() => {
      return allPhotos.value.slice(startIndex.value, endIndex.value)
    })

    // Spacers for virtual scrolling
    const spacerTop = computed(() => {
      const rows = Math.floor(startIndex.value / itemsPerRow.value)
      return rows * rowHeight
    })

    const spacerBottom = computed(() => {
      const totalItems = allPhotos.value.length
      const visibleEndIndex = endIndex.value
      const remainingItems = Math.max(0, totalItems - visibleEndIndex)
      const remainingRows = Math.ceil(remainingItems / itemsPerRow.value)
      return remainingRows * rowHeight
    })

    // Update cache stats periodically
    const updateCacheStats = () => {
      cacheStats.value = imageCache.getStats()
    }

    // Smooth scroll handler with debouncing
    const handleScroll = (event) => {
      const currentScrollTop = event.target.scrollTop

      // Cancel any pending animation frame
      if (scrollAnimationFrame) {
        cancelAnimationFrame(scrollAnimationFrame)
      }

      // Use requestAnimationFrame for smooth updates
      scrollAnimationFrame = requestAnimationFrame(() => {
        // Calculate velocity for smooth scrolling prediction
        scrollVelocity = currentScrollTop - lastScrollTop
        lastScrollTop = currentScrollTop

        // Update scroll position
        scrollTop.value = currentScrollTop

        // Update cache stats less frequently during scroll
        if (Math.abs(scrollVelocity) < 5) {
          updateCacheStatsDebounced()
        }
      })
    }

    // Update dimensions with debouncing
    let dimensionsTimeout = null
    const updateDimensions = () => {
      if (dimensionsTimeout) clearTimeout(dimensionsTimeout)

      dimensionsTimeout = setTimeout(() => {
        if (!scrollContainer.value) return

        containerHeight.value = scrollContainer.value.clientHeight
        const containerWidth = scrollContainer.value.clientWidth - 40 // Account for padding
        const itemWidth = 120 + 16
        itemsPerRow.value = Math.floor(containerWidth / itemWidth) || 1
      }, 50) // Small delay to batch dimension updates
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

    const errorCount = computed(() => cacheStats.value.errors)
    const hasErrors = computed(() => cacheStats.value.errors > 0)

    const reloadFailedPhotos = () => {
      const retried = imageCache.retryErrors()
      if (retried > 0) {
        updateCacheStats()
      }
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
    let cacheUpdateTimeout = null
    const updateCacheStatsDebounced = () => {
      if (cacheUpdateTimeout) clearTimeout(cacheUpdateTimeout)
      cacheUpdateTimeout = setTimeout(updateCacheStats, 100)
    }

    onMounted(async () => {
      await loadPhotoStructure()

      nextTick(() => {
        updateDimensions()
        setupResizeObserver()

        // Initialize scroll position
        if (scrollContainer.value) {
          scrollTop.value = scrollContainer.value.scrollTop || 0
          lastScrollTop = scrollTop.value
        }

        // Update cache stats periodically
        statsInterval = setInterval(updateCacheStats, 1000)
      })
    })

    onUnmounted(() => {
      if (resizeObserver) {
        resizeObserver.disconnect()
      }
      if (scrollAnimationFrame) {
        cancelAnimationFrame(scrollAnimationFrame)
      }
      if (statsInterval) {
        clearInterval(statsInterval)
      }
      if (dimensionsTimeout) {
        clearTimeout(dimensionsTimeout)
      }
      if (cacheUpdateTimeout) {
        clearTimeout(cacheUpdateTimeout)
      }

      // Clear cache when component unmounts
      imageCache.clearAll()
    })

    return {
      currentPath,
      currentDirectories,
      allPhotos,
      visiblePhotos,
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
      startIndex,
      endIndex,
      spacerTop,
      spacerBottom,
      scrollTop,
      navigateToDirectory,
      navigateToPath,
      goBack,
      openPhotoModal,
      closePhotoModal,
      navigatePhoto,
      handleImageLoaded,
      handleScroll,
      errorCount,
      hasErrors,
      reloadFailedPhotos
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
  overflow-y: scroll; /* Always show scrollbar */
  overflow-x: hidden;
  position: relative;
  /* Smooth scrolling with momentum */
  -webkit-overflow-scrolling: touch;
  scroll-behavior: auto; /* Let JS handle smooth scrolling */
  /* Stabilize scrollbar gutter */
  scrollbar-gutter: stable;
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

.reload-button {
  float: right;
  font-size: var(--font-size-sm);
  font-family: inherit;
  background: var(--color-bg-primary);
  border: var(--border-raised);
  padding: 1px var(--space-3);
  cursor: pointer;
  color: var(--color-text-primary);
}

.reload-button:hover {
  background: var(--color-primary);
  color: var(--color-text-inverse);
}

.reload-button:active {
  border: var(--border-inset);
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

.photos-virtual-container {
  position: relative;
  width: 100%;
  /* Ensure stable layout during scrolling */
  transform: translateZ(0);
  will-change: contents;
}

.virtual-spacer-top,
.virtual-spacer-bottom {
  width: 100%;
  /* Ensure spacers don't interfere with layout */
  font-size: 0;
  line-height: 0;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-4);
  position: relative;
  /* Prevent layout shifts during image loading */
  contain: layout style;
  min-height: 156px; /* Match row height */
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