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
        <IconItem
          v-for="directory in currentDirectories"
          :key="directory"
          icon="/assets/closedfolder.png"
          hoverIcon="/assets/openfolder.png"
          :label="directory"
          @click="navigateToDirectory(directory)"
        />

        <!-- Photos -->
        <PhotoThumbnail
          v-for="photo in currentPhotos"
          :key="photo.name"
          :photo="photo"
          :currentPath="currentPath"
          @click="openPhotoModal(photo)"
        />
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
import { ref, computed } from 'vue'
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

    const currentPhotos = computed(() => {
      const node = getCurrentNode()
      return node ? (node.file_details || []) : []
    })

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
      currentPath.value = currentPath.value
        ? `${currentPath.value}/${directory}`
        : directory
    }

    const navigateToPath = (index) => {
      const segments = pathSegments.value
      currentPath.value = segments.slice(0, index + 1).join('/')
    }

    const goBack = () => {
      if (pathSegments.value.length > 0) {
        const segments = pathSegments.value
        segments.pop()
        currentPath.value = segments.join('/')
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

    // Load photo structure on component mount
    loadPhotoStructure()

    return {
      currentPath,
      currentDirectories,
      currentPhotos,
      pathSegments,
      loading,
      showModal,
      selectedPhoto,
      navigateToDirectory,
      navigateToPath,
      goBack,
      openPhotoModal,
      closePhotoModal,
      navigatePhoto
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
  flex-wrap: wrap;
  gap: var(--space-4);
  padding: var(--space-4);
}
</style>