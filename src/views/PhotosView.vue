<template>
  <AppShell
    :title-bar-text="titleBarText"
    :has-overlay="allPhotos.length > 0"
  >
    <div class="header">
      <div class="prompt-line">
        {{ promptLine }}
      </div>
      <AppNav active-section="photos" />
    </div>

    <div class="page-heading">
      <a
        v-if="pathSegments.length"
        href="#"
        class="up-link"
        @click.prevent="goUp"
      >&larr; cd ..</a>
      <h1>{{ heading }}</h1>
      <div
        v-if="!pathSegments.length"
        class="page-subtitle"
      >
        Mostly film. One album per trip, place or obsession.
      </div>
    </div>

    <div
      v-if="pathNotFound"
      class="empty-state"
    >
      Directory not found.
    </div>
    <div
      v-else-if="loading"
      class="empty-state"
    >
      Loading&hellip;
    </div>

    <template v-else>
      <div
        v-if="currentDirectories.length"
        class="album-grid"
      >
        <PhotoAlbumCard
          v-for="dir in currentDirectories"
          :key="dir"
          :name="dir"
          :to="childRoute(dir)"
          :covers="coversFor(dir)"
          :total-photos="childNode(dir)?.total_photos || 0"
        />
      </div>

      <div
        v-if="dayGroups.length"
        class="day-groups"
      >
        <div
          v-for="group in dayGroups"
          :key="group.dayKey"
          class="day-group"
        >
          <div class="day-label">
            {{ group.label }}
          </div>
          <div class="photo-grid">
            <PhotoTile
              v-for="photo in group.photos"
              :key="photo.name"
              :photo="photo"
              :full-path="currentPath ? `${currentPath}/${photo.name}` : photo.name"
              :day-label="photo.dayLabel"
              load-immediately
              @click="openLightbox(photo.index)"
            />
          </div>
        </div>
      </div>

      <div
        v-if="!currentDirectories.length && !dayGroups.length"
        class="empty-state"
      >
        No photos here yet.
      </div>
    </template>

    <PhotoLightbox
      v-if="lightboxIndex !== null"
      :photos="flatPhotos"
      :open-index="lightboxIndex"
      :album-path="currentPath"
      @close="lightboxIndex = null"
      @navigate="lightboxIndex = $event"
    />
  </AppShell>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppShell from '@/components/shell/AppShell.vue'
import AppNav from '@/components/shell/AppNav.vue'
import PhotoAlbumCard from '@/components/photos/PhotoAlbumCard.vue'
import PhotoTile from '@/components/photos/PhotoTile.vue'
import PhotoLightbox from '@/components/photos/PhotoLightbox.vue'
import config from '@/config/env'
import { collectFirstPhotos } from '@/utils/photoAlbumCover'
import { groupPhotosByDay } from '@/utils/photoDayGroups'

const router = useRouter()
const route = useRoute()

const pathFromRoute = (p) => (Array.isArray(p) ? p.join('/') : p || '')

const loading = ref(true)
const photoStructure = ref(null)
const currentPath = ref(pathFromRoute(route.params.pathMatch))
const pathNotFound = ref(false)
const lightboxIndex = ref(null)

const pathSegments = computed(() => currentPath.value.split('/').filter(Boolean))

function getCurrentNode() {
  if (!photoStructure.value) return null
  if (!currentPath.value) return photoStructure.value

  let node = photoStructure.value
  for (const segment of pathSegments.value) {
    node = node.children?.[segment]
    if (!node) return null
  }
  return node
}

const currentDirectories = computed(() => getCurrentNode()?.subdirs || [])
const allPhotos = computed(() => getCurrentNode()?.file_details || [])

const dayGroupData = computed(() => groupPhotosByDay(allPhotos.value))
const dayGroups = computed(() => dayGroupData.value.groups)
const flatPhotos = computed(() => dayGroupData.value.flat)

const heading = computed(() => pathSegments.value.at(-1) || 'Photos')
const promptLine = computed(() =>
  pathSegments.value.length
    ? `C:\\lisandro\\photos> cd ${pathSegments.value.at(-1)}`
    : 'C:\\lisandro> cd photos'
)
const titleBarText = computed(
  () => `Command Prompt — lisandro\\photos${currentPath.value ? '\\' + pathSegments.value.join('\\') : ''}`
)

function childNode(dir) {
  return getCurrentNode()?.children?.[dir]
}

function coversFor(dir) {
  const node = childNode(dir)
  return collectFirstPhotos(node).map((photo) => ({
    ...photo,
    fullPath: currentPath.value ? `${currentPath.value}/${dir}/${photo.path}` : `${dir}/${photo.path}`
  }))
}

function childRoute(dir) {
  const newPath = currentPath.value ? `${currentPath.value}/${dir}` : dir
  return `/photos/${newPath}`
}

function goUp() {
  const segments = [...pathSegments.value]
  segments.pop()
  router.push(segments.length ? `/photos/${segments.join('/')}` : '/photos')
}

function openLightbox(index) {
  lightboxIndex.value = index
}

async function loadPhotoStructure() {
  try {
    loading.value = true
    const response = await fetch(config.getPhotoIndexUrl(), { cache: 'no-cache' })
    if (!response.ok) throw new Error('Failed to load photo index')
    photoStructure.value = await response.json()
    if (currentPath.value && getCurrentNode() === null) pathNotFound.value = true
  } catch (error) {
    console.error('Failed to load photo structure:', error)
  } finally {
    loading.value = false
  }
}

watch(
  () => route.params.pathMatch,
  (newMatch) => {
    const newPath = pathFromRoute(newMatch)
    if (newPath === currentPath.value) return
    currentPath.value = newPath
    pathNotFound.value = false
    lightboxIndex.value = null
    if (photoStructure.value && newPath && getCurrentNode() === null) {
      pathNotFound.value = true
    }
  }
)

onMounted(loadPhotoStructure)
</script>

<style scoped>
.header {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.prompt-line {
  color: var(--f0-muted);
  font-size: var(--fs-meta);
}

.page-heading {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.up-link {
  align-self: flex-start;
  font-size: var(--fs-meta);
  color: var(--f0-muted);
}

.page-heading h1 {
  margin: 0;
  font-size: var(--fs-h1);
  line-height: 1.1;
  color: var(--f0-strong);
}

.page-subtitle {
  color: var(--f0-muted);
}

.empty-state {
  color: var(--f0-muted);
}

.album-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 40px 28px;
}

.day-groups {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.day-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.day-label {
  font-weight: 700;
  color: var(--f0-strong);
}

.photo-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 3px;
}

@media (max-width: 768px) {
  .album-grid {
    grid-template-columns: 1fr;
  }

  .photo-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
