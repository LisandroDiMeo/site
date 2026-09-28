<template>
  <div
    ref="overlayEl"
    role="dialog"
    aria-modal="true"
    aria-label="Photo viewer"
    class="lightbox"
    @keydown="handleKeydown"
  >
    <div class="lightbox-bar">
      <button
        ref="closeBtn"
        class="lbtn"
        @click="$emit('close')"
      >
        &#10005; close
      </button>
      <span class="lightbox-counter">{{ current.index + 1 }} / {{ photos.length }}</span>
      <span class="lightbox-day">{{ dayLabel }}</span>
    </div>
    <div class="lightbox-body">
      <button
        ref="prevBtn"
        class="lbtn"
        aria-label="Previous photo"
        :disabled="current.index === 0"
        @click="$emit('navigate', current.index - 1)"
      >
        &larr;
      </button>
      <div class="lightbox-image-wrap">
        <img
          :src="imageUrl"
          :alt="current.photo.name"
          class="lightbox-image"
        >
      </div>
      <button
        ref="nextBtn"
        class="lbtn"
        aria-label="Next photo"
        :disabled="current.index === photos.length - 1"
        @click="$emit('navigate', current.index + 1)"
      >
        &rarr;
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import imageCache from '@/data/ImageCacheManager.js'
import config from '@/config/env'

const props = defineProps({
  photos: { type: Array, required: true },
  openIndex: { type: Number, required: true },
  albumPath: { type: String, default: '' }
})

const emit = defineEmits(['close', 'navigate'])

const overlayEl = ref(null)
const closeBtn = ref(null)
const prevBtn = ref(null)
const nextBtn = ref(null)
const imageUrl = ref(null)

const current = computed(() => ({
  index: props.openIndex,
  photo: props.photos[props.openIndex]
}))

const dayLabel = computed(() => current.value.photo?.dayLabel || '')

function fullUrl(photo) {
  const path = props.albumPath ? `${props.albumPath}/${photo.name}` : photo.name
  return config.getPhotoUrl(path)
}

let cacheSubscription = null
let subscribedUrl = null

function loadCurrent() {
  const photo = current.value.photo
  if (!photo) return
  const url = fullUrl(photo)

  if (cacheSubscription && subscribedUrl) {
    imageCache.unsubscribe(subscribedUrl, cacheSubscription)
  }

  imageUrl.value = null
  cacheSubscription = (data) => {
    if (data.status === 'loaded') imageUrl.value = data.url
  }
  subscribedUrl = url
  imageCache.subscribe(url, cacheSubscription)
  imageCache.loadImage(url).catch(() => {})
}

watch(() => props.openIndex, loadCurrent)

function handleKeydown(event) {
  if (event.key === 'Escape') {
    emit('close')
  } else if (event.key === 'ArrowLeft' && current.value.index > 0) {
    emit('navigate', current.value.index - 1)
  } else if (event.key === 'ArrowRight' && current.value.index < props.photos.length - 1) {
    emit('navigate', current.value.index + 1)
  } else if (event.key === 'Tab') {
    trapFocus(event)
  }
}

function trapFocus(event) {
  const focusables = [closeBtn.value, prevBtn.value, nextBtn.value].filter(
    (el) => el && !el.disabled
  )
  if (focusables.length === 0) return
  const first = focusables[0]
  const last = focusables[focusables.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

onMounted(() => {
  loadCurrent()
  nextTick(() => closeBtn.value?.focus())
})

onUnmounted(() => {
  if (cacheSubscription && subscribedUrl) {
    imageCache.unsubscribe(subscribedUrl, cacheSubscription)
  }
})
</script>

<style scoped>
.lightbox {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: var(--f0-window);
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 28px 48px;
  z-index: 10;
}

.lightbox-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.lightbox-counter {
  color: var(--f0-strong);
  font-weight: 700;
}

.lightbox-day {
  color: var(--f0-muted);
  min-width: 120px;
  text-align: right;
}

.lightbox-body {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-grow: 1;
  min-height: 0;
}

.lightbox-image-wrap {
  flex-grow: 1;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}

.lightbox-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.lbtn {
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--f0-strong);
  background: #c0c0c0;
  border: 0;
  box-shadow: inset -1px -1px #404040, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf;
  min-width: 44px;
  height: 44px;
  padding: 0 14px;
  cursor: pointer;
}

.lbtn:active {
  box-shadow: inset 1px 1px #404040, inset -1px -1px #fff;
}

.lbtn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .lightbox {
    padding: 16px;
  }
}
</style>
