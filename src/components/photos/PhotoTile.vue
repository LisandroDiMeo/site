<template>
  <a
    ref="rootEl"
    class="photo-tile"
    :class="{ 'is-error': error }"
    :aria-label="`${photo.name}${dayLabel ? `, ${dayLabel}` : ''}`"
    :style="tileStyle"
    :href="href"
    target="_blank"
    rel="noopener"
  />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import imageCache from '@/data/ImageCacheManager.js'
import config from '@/config/env'

const props = defineProps({
  photo: { type: Object, required: true },
  fullPath: { type: String, required: true },
  dayLabel: { type: String, default: '' },
  href: { type: String, default: '' },
  loadImmediately: { type: Boolean, default: false }
})

const loading = ref(true)
const error = ref(false)
const imageUrl = ref(null)
const isInView = ref(false)
const rootEl = ref(null)
const loadOptions = { quality: 0.6 }

const url = computed(() => config.getPhotoUrl(props.fullPath))

let observer = null
let cacheSubscription = null

const handleCacheUpdate = (data) => {
  if (data.status === 'loading') {
    loading.value = true
    error.value = false
  } else if (data.status === 'loaded') {
    loading.value = false
    error.value = false
    imageUrl.value = data.url
  } else if (data.status === 'error') {
    loading.value = false
    error.value = true
  }
}

const loadImage = async () => {
  if (!isInView.value && !props.loadImmediately) return
  cacheSubscription = handleCacheUpdate
  imageCache.subscribe(url.value, cacheSubscription, loadOptions)
  try {
    await imageCache.loadImage(url.value, loadOptions)
  } catch {
    // handled via subscription
  }
}

const setupObserver = (el) => {
  if (!el) return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isInView.value) {
          isInView.value = true
          loadImage()
          observer?.disconnect()
          observer = null
        }
      })
    },
    { rootMargin: '150px', threshold: 0.01 }
  )
  observer.observe(el)
}

const tileStyle = computed(() => {
  if (imageUrl.value && !error.value) {
    return { backgroundImage: `url(${imageUrl.value})` }
  }
  return {}
})

watch(
  () => props.loadImmediately,
  (value) => {
    if (value && !isInView.value) {
      isInView.value = true
      loadImage()
    }
  }
)

onMounted(() => {
  if (props.loadImmediately) {
    isInView.value = true
    loadImage()
  } else {
    setupObserver(rootEl.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
  if (cacheSubscription) imageCache.unsubscribe(url.value, cacheSubscription, loadOptions)
  imageCache.cancel(url.value, loadOptions)
})
</script>

<style scoped>
.photo-tile {
  border: 0;
  padding: 0;
  margin: 0;
  aspect-ratio: 1 / 1;
  width: 100%;
  cursor: pointer;
  display: block;
  background-color: var(--f0-code-bg);
  background-size: cover;
  background-position: center;
}

.photo-tile:hover {
  filter: brightness(1.06);
}

.photo-tile:focus-visible {
  outline: 3px solid var(--f0-accent);
  outline-offset: -3px;
}

.photo-tile.is-error {
  background-color: rgba(128, 0, 0, 0.15);
}
</style>
