<template>
  <div class="photo-thumbnail" @click="handleClick" :data-name="photo.name">
    <div class="thumbnail-container" :class="{'is-loading': loading, 'has-error': error}">
      <!-- Placeholder while loading -->
      <div v-if="loading" class="loading-placeholder">
        <img src="/assets/hourglass.gif" alt="Loading..." class="loading-icon"/>
      </div>

      <!-- Loaded image -->
      <img v-else-if="imageUrl && !error"
           :src="imageUrl"
           :alt="photo.name"
           class="thumbnail-image loaded"
      >

      <!-- Error state -->
      <img v-else-if="error"
           src="/assets/person_doc.png"
           :alt="photo.name"
           class="thumbnail-image error-image">
    </div>
    <span class="thumbnail-label">{{ photo.name }}</span>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import imageCache from "@/data/ImageCacheManager.js";

export default {
  name: 'PhotoThumbnail',
  props: {
    photo: {
      type: Object,
      required: true
    },
    currentPath: {
      type: String,
      required: true
    },
    loadImmediately: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const loading = ref(true)
    const error = ref(false)
    const imageUrl = ref(null)
    const isInView = ref(false)
    let observer = null
    let cacheSubscription = null

    const thumbnailPath = computed(() => {
      let basePath = '/assets/photos'
      if (props.currentPath) {
        basePath += `/${props.currentPath}`
      }
      basePath += `/${props.photo.name}`
      return basePath
    })

    // Handle cache updates
    const handleCacheUpdate = (data) => {
      switch (data.status) {
        case 'loading':
          loading.value = true
          error.value = false
          break
        case 'loaded':
          loading.value = false
          error.value = false
          imageUrl.value = data.url
          emit('imageLoaded', props.photo)
          break
        case 'error':
          loading.value = false
          error.value = true
          console.error('Image failed to load:', props.photo.name, data.error)
          break
      }
    }

    // Load image from cache
    const loadImage = async () => {
      if (!isInView.value && !props.loadImmediately) return

      try {
        // Subscribe to cache updates
        cacheSubscription = (data) => handleCacheUpdate(data)
        imageCache.subscribe(thumbnailPath.value, cacheSubscription)

        // Try to load with quality reduction for faster loading
        await imageCache.loadImage(thumbnailPath.value, {
          quality: 0.6  // Reduce quality to 60% for thumbnails
        })
      } catch (err) {
        // Error handling is done through subscription
      }
    }

    // Setup intersection observer
    const setupObserver = () => {
      const options = {
        rootMargin: '100px', // Start loading 100px before entering viewport
        threshold: 0.01
      }

      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !isInView.value) {
            isInView.value = true
            loadImage()

            // Once loaded, we can disconnect the observer
            if (observer) {
              observer.disconnect()
              observer = null
            }
          }
        })
      }, options)

      // Observe the component's root element
      const element = document.querySelector(`[data-name="${props.photo.name}"]`)
      if (element && observer) {
        observer.observe(element)
      }
    }

    const handleClick = () => {
      if (!loading.value) {
        emit('click', props.photo)
      }
    }

    // Watch for immediate load prop
    watch(() => props.loadImmediately, (newVal) => {
      if (newVal && !isInView.value) {
        isInView.value = true
        loadImage()
      }
    })

    onMounted(() => {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        if (props.loadImmediately) {
          isInView.value = true
          loadImage()
        } else {
          setupObserver()
        }
      }, 10)
    })

    onUnmounted(() => {
      if (observer) {
        observer.disconnect()
      }

      if (cacheSubscription) {
        imageCache.unsubscribe(thumbnailPath.value, cacheSubscription)
      }
    })

    return {
      loading,
      error,
      imageUrl,
      handleClick
    }
  }
}
</script>

<style scoped>
.photo-thumbnail {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  width: 120px;
  height: 140px; /* Fixed height to prevent shifts */
  user-select: none;
}

.thumbnail-container {
  width: 100px;
  height: 100px;
  padding: var(--space-2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background-color: var(--color-bg-secondary);
  transition: background-color 0.2s;
  /* Prevent layout shifts */
  overflow: hidden;
  flex-shrink: 0;
  /* Optimize for scrolling */
  will-change: transform;
  transform: translateZ(0);
}

.thumbnail-container.is-loading {
  background-color: var(--color-bg-secondary);
}

.thumbnail-container.has-error {
  background-color: rgba(255, 0, 0, 0.1);
}

.loading-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.loading-icon {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
}

.thumbnail-image {
  max-width: 90px;
  max-height: 90px;
  object-fit: contain;
  image-rendering: auto;
  opacity: 0;
  transition: opacity 0.2s ease-out;
  /* Prevent image from jumping during load */
  position: relative;
  z-index: 1;
}

.thumbnail-image.loaded,
.error-image {
  opacity: 1;
}

.error-image {
  image-rendering: pixelated;
}

.thumbnail-label {
  margin-top: var(--space-2);
  font-size: var(--font-size-sm);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.photo-thumbnail:hover .thumbnail-container:not(.is-loading) {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  outline: var(--border-width-thin) dotted var(--color-text-inverse);
  outline-offset: -2px;
}

.photo-thumbnail:hover .thumbnail-label {
  color: var(--color-text-inverse);
}
</style>