<template>
  <Teleport to="body">
    <div
      class="viewer-backdrop"
      @click.self="close"
    >
      <div
        class="viewer-window"
        role="dialog"
        aria-modal="true"
        :aria-label="photo.name"
      >
        <div class="viewer-titlebar">
          <span class="viewer-title">{{ photo.name }}<template v-if="photo.dayLabel"> — {{ photo.dayLabel }}</template></span>
          <button
            class="viewer-btn"
            aria-label="Close"
            @click="close"
          >
            &times;
          </button>
        </div>

        <div class="viewer-stage">
          <img
            v-if="displayUrl"
            :key="displayUrl"
            :src="displayUrl"
            :alt="photo.name"
            class="viewer-image"
            :class="{ 'is-preview': !mediumUrl }"
          >
          <div
            v-if="error"
            class="viewer-status"
          >
            Couldn't load this photo.
          </div>
        </div>

        <div class="viewer-toolbar">
          <button
            class="viewer-btn wide"
            :disabled="index === 0"
            @click="go(-1)"
          >
            &larr; Prev
          </button>
          <span class="viewer-count">{{ index + 1 }} / {{ photos.length }}</span>
          <button
            class="viewer-btn wide"
            :disabled="index === photos.length - 1"
            @click="go(1)"
          >
            Next &rarr;
          </button>
          <a
            class="viewer-btn wide original-link"
            :href="originalUrl"
            target="_blank"
            rel="noopener"
          >View original</a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import imageCache from '@/data/ImageCacheManager.js'
import config from '@/config/env'

// `photos`: [{ name, fullPath, modified, dayLabel }] in display order.
const props = defineProps({
  photos: { type: Array, required: true },
  index: { type: Number, required: true }
})

const emit = defineEmits(['close', 'update:index'])

const photo = computed(() => props.photos[props.index])
const originalUrl = computed(() => config.getPhotoUrl(photo.value.fullPath))

const mediumKey = (p) => config.getPhotoVariantUrl(p.fullPath, 'medium', p.modified)
const thumbKey = (p) => config.getPhotoVariantUrl(p.fullPath, 'thumb', p.modified)
const mediumOptions = (p) => ({ fallback: config.getPhotoUrl(p.fullPath) })
const thumbOptions = (p) => ({ fallback: config.getPhotoUrl(p.fullPath), fallbackQuality: 0.6 })

const mediumUrl = ref(null)
const thumbUrl = ref(null)
const error = ref(false)
const displayUrl = computed(() => mediumUrl.value || thumbUrl.value)

let current = null // { photo, onMedium, onThumb }

function unsubscribeCurrent() {
  if (!current) return
  imageCache.unsubscribe(mediumKey(current.photo), current.onMedium, mediumOptions(current.photo))
  imageCache.unsubscribe(thumbKey(current.photo), current.onThumb, thumbOptions(current.photo))
  current = null
}

function show(p) {
  unsubscribeCurrent()
  mediumUrl.value = null
  thumbUrl.value = null
  error.value = false

  const entry = {
    photo: p,
    // The grid already cached the thumbnail, so it paints instantly while the medium loads.
    onThumb: (data) => { if (data.status === 'loaded') thumbUrl.value = data.url },
    onMedium: (data) => {
      if (data.status === 'loaded') mediumUrl.value = data.url
      else if (data.status === 'error') error.value = true
    }
  }
  current = entry
  imageCache.subscribe(thumbKey(p), entry.onThumb, thumbOptions(p))
  imageCache.subscribe(mediumKey(p), entry.onMedium, mediumOptions(p))
  imageCache.loadImage(mediumKey(p), mediumOptions(p)).catch(() => {})

  // Warm the next photo so arrowing forward feels instant.
  const next = props.photos[props.index + 1]
  if (next) imageCache.loadImage(mediumKey(next), mediumOptions(next)).catch(() => {})
}

function go(step) {
  const target = props.index + step
  if (target >= 0 && target < props.photos.length) emit('update:index', target)
}

function close() {
  emit('close')
}

function onKey(event) {
  if (event.key === 'Escape') close()
  else if (event.key === 'ArrowLeft') go(-1)
  else if (event.key === 'ArrowRight') go(1)
}

watch(photo, (p) => p && show(p))

let previousOverflow = ''
onMounted(() => {
  show(photo.value)
  window.addEventListener('keydown', onKey)
  previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  unsubscribeCurrent()
  window.removeEventListener('keydown', onKey)
  document.body.style.overflow = previousOverflow
})
</script>

<style scoped>
.viewer-backdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.viewer-window {
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 100%;
  border: 2px solid #c0c0c0;
  box-shadow: 0 0 0 1px #404040, 0 20px 50px rgba(0, 0, 0, 0.35);
  background: var(--f0-window);
  font-family: var(--font-body);
}

.viewer-titlebar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 30px;
  padding: 0 4px 0 10px;
  background: linear-gradient(90deg, var(--f0-title-a), var(--f0-title-b));
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.viewer-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.viewer-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: min(60vw, 100%);
  min-height: 40vh;
  background: var(--f0-code-bg);
  overflow: hidden;
}

.viewer-image {
  display: block;
  max-width: calc(100vw - 52px);
  max-height: calc(100vh - 140px);
  object-fit: contain;
}

/* Upscaled thumbnail shown while the medium version arrives */
.viewer-image.is-preview {
  min-width: min(60vw, calc(100vw - 52px));
  filter: blur(6px);
}

.viewer-status {
  position: absolute;
  color: var(--f0-muted);
}

.viewer-toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  flex-wrap: wrap;
}

.viewer-count {
  color: var(--f0-muted);
  font-size: var(--fs-meta);
  padding: 0 4px;
}

.viewer-btn {
  min-width: 20px;
  height: 18px;
  padding: 0;
  border: 0;
  background: #c0c0c0;
  box-shadow: inset -1px -1px #404040, inset 1px 1px #fff;
  color: #000;
  font-family: inherit;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  cursor: pointer;
}

.viewer-btn.wide {
  height: 26px;
  line-height: 26px;
  padding: 0 12px;
  font-size: 14px;
}

.viewer-btn:active:not(:disabled) {
  box-shadow: inset 1px 1px #404040, inset -1px -1px #fff;
}

.viewer-btn:disabled {
  color: #808080;
  cursor: default;
}

.original-link {
  margin-left: auto;
  text-decoration: none;
  border: 0;
}

.original-link:hover {
  color: #000;
  border: 0;
}

@media (max-width: 768px) {
  .viewer-backdrop {
    padding: 8px;
  }

  .viewer-image {
    max-width: calc(100vw - 20px);
  }
}
</style>
