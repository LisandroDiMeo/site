<template>
  <div class="photo-thumbnail" @click="handleClick">
    <div class="thumbnail-container" :class="{'is-loading': !imageLoaded && !imageError}">
      <img v-show="imageLoaded"
           :src="thumbnailPath"
           :alt="photo.name"
           class="thumbnail-image"
           @error="handleImageError"
           @load="handleImageLoad"
           loading="lazy"
           decoding="async"
      >
      <div v-if="!imageLoaded && !imageError" class="loading-placeholder">
        <img src="/assets/hourglass.gif" alt="Loading..." class="loading-icon"/>
      </div>
      <img v-if="imageError" src="/assets/person_doc.png" :alt="photo.name" class="thumbnail-image">
    </div>
    <span class="thumbnail-label">{{ photo.name }}</span>
  </div>
</template>

<script>
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
    }
  },
  data() {
    return {
      imageError: false,
      imageLoaded: false,
    }
  },
  computed: {
    thumbnailPath() {
      if (this.imageError) {
        return '/assets/person_doc.png'
      }
      
      // Construct the correct path
      let basePath = '/assets/photos'
      if (this.currentPath) {
        basePath += `/${this.currentPath}`
      }
      basePath += `/${this.photo.name}`
      
      console.log('Loading image from:', basePath) // Debug log
      
      return basePath
    }
  },
  methods: {
    handleImageError() {
      console.error('Image failed to load:', this.photo.name)
      this.imageError = true
      this.imageLoaded = false
    },
    handleImageLoad() {
      this.imageLoaded = true
      // Optional: Add a small delay to prevent layout shifts
      this.$nextTick(() => {
        this.$emit('imageLoaded', this.photo)
      })
    },
    handleClick() {
      if (this.imageLoaded || this.imageError) {
        this.$emit('click', this.photo)
      }
    }
  },
  watch: {
    // Reset states when photo or path changes
    '$props': {
      handler() {
        this.imageError = false
        this.imageLoaded = false
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.photo-thumbnail {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  margin: var(--space-3);
  cursor: pointer;
  width: 120px;
}

.thumbnail-container {
  width: 100px;
  height: 100px;
  border: var(--border-primary);
  padding: var(--space-2);
  background-color: var(--color-bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  /* Add hardware acceleration */
  transform: translateZ(0);
  will-change: transform;
}

.thumbnail-container.is-loading {
  background-color: var(--color-bg-secondary);
}

.loading-placeholder {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
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
  image-rendering: pixelated;
  /* Optimize image rendering */
  image-rendering: -webkit-optimize-contrast;
  backface-visibility: hidden;
  transform: translateZ(0);
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
  border-color: var(--color-border-hover);
  background-color: var(--color-bg-hover);
}
</style>