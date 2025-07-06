<template>
  <div class="photo-thumbnail" @click="$emit('click', photo)">
    <div class="thumbnail-container">
      <img 
        :src="thumbnailPath" 
        :alt="photo.name"
        class="thumbnail-image"
        @error="handleImageError"
      >
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
      imageError: false
    }
  },
  computed: {
    thumbnailPath() {
      if (this.imageError) {
        return '/assets/person_doc.png'
      }
      return `/assets/photos/${this.currentPath}/${this.photo.name}`
    }
  },
  methods: {
    handleImageError() {
      this.imageError = true
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
}

.thumbnail-image {
  max-width: 90px;
  max-height: 90px;
  object-fit: contain;
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

.photo-thumbnail:hover .thumbnail-container {
  border-color: var(--color-border-hover);
  background-color: var(--color-bg-hover);
}
</style> 