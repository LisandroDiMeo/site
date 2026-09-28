<template>
  <RouterLink
    :to="to"
    class="album-card"
  >
    <div class="album-cover">
      <div
        v-for="(tile, index) in coverTiles"
        :key="index"
        class="cover-tile"
        :style="tile.style"
      />
    </div>
    <div class="album-meta">
      <span class="album-name">{{ name }}</span>
      <span class="album-info">
        <template v-if="dateLabel">{{ dateLabel }} &middot; </template>{{ totalPhotos }} photo{{ totalPhotos === 1 ? '' : 's' }}
      </span>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive } from 'vue'
import imageCache from '@/data/ImageCacheManager.js'
import config from '@/config/env'
import { coverDateLabel } from '@/utils/photoAlbumCover'

const props = defineProps({
  name: { type: String, required: true },
  to: { type: [String, Object], required: true },
  covers: { type: Array, default: () => [] },
  totalPhotos: { type: Number, default: 0 }
})

const dateLabel = computed(() => coverDateLabel(props.covers))

const urls = reactive(new Map())
const subscriptions = []

function fullUrl(cover) {
  return config.getPhotoUrl(cover.fullPath)
}

onMounted(() => {
  for (const cover of props.covers) {
    const url = fullUrl(cover)
    const callback = (data) => {
      if (data.status === 'loaded') urls.set(url, data.url)
    }
    subscriptions.push([url, callback])
    imageCache.subscribe(url, callback, { quality: 0.6 })
    imageCache.loadImage(url, { quality: 0.6 }).catch(() => {})
  }
})

onUnmounted(() => {
  for (const [url, callback] of subscriptions) {
    imageCache.unsubscribe(url, callback, { quality: 0.6 })
    imageCache.cancel(url, { quality: 0.6 })
  }
})

const coverTiles = computed(() => {
  const tiles = props.covers.slice(0, 4).map((cover) => {
    const url = urls.get(fullUrl(cover))
    return { style: url ? { backgroundImage: `url(${url})` } : {} }
  })
  while (tiles.length < 4) tiles.push({ style: {} })
  return tiles
})
</script>

<style scoped>
.album-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--f0-text);
  border: none;
}

.album-card:hover {
  border: none;
  color: var(--f0-accent);
}

.album-card:hover .album-cover {
  outline: 2px solid var(--f0-accent);
  outline-offset: 3px;
}

.album-cover {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3px;
  aspect-ratio: 1 / 1;
}

.cover-tile {
  background-color: var(--f0-rule);
  background-size: cover;
  background-position: center;
}

.album-meta {
  display: flex;
  flex-direction: column;
}

.album-name {
  font-weight: 700;
}

.album-info {
  color: var(--f0-muted);
  font-size: var(--fs-meta);
}
</style>
