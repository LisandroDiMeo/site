<template>
  <div v-if="show" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <span class="modal-title">{{ currentPhoto.name }}</span>
        <button class="close-button" @click="closeModal">×</button>
      </div>
      
      <div class="modal-body">
        <button 
          class="nav-button prev" 
          @click="navigatePhotos(-1)"
          :disabled="currentIndex === 0"
        >←</button>
        
        <img :src="photoPath" :alt="currentPhoto.name" class="modal-image">
        
        <button 
          class="nav-button next" 
          @click="navigatePhotos(1)"
          :disabled="currentIndex === photos.length - 1"
        >→</button>
      </div>
      
      <div class="modal-footer">
        <span>{{ currentIndex + 1 }} of {{ photos.length }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PhotoModal',
  props: {
    show: {
      type: Boolean,
      required: true
    },
    photos: {
      type: Array,
      required: true
    },
    currentPhoto: {
      type: Object,
      required: true
    },
    currentPath: {
      type: String,
      required: true
    }
  },
  computed: {
    currentIndex() {
      return this.photos.findIndex(photo => photo.name === this.currentPhoto.name)
    },
    photoPath() {
      return `/assets/photos/${this.currentPath}/${this.currentPhoto.name}`
    }
  },
  methods: {
    closeModal() {
      this.$emit('close')
    },
    navigatePhotos(direction) {
      const newIndex = this.currentIndex + direction
      if (newIndex >= 0 && newIndex < this.photos.length) {
        this.$emit('navigate', this.photos[newIndex])
      }
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: var(--color-bg-primary);
  border: var(--border-primary);
  border-width: 2px;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  background-color: var(--color-bg-header);
  padding: var(--space-2) var(--space-4);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  color: var(--color-text-inverse);
  font-weight: var(--font-weight-bold);
}

.close-button {
  background: none;
  border: none;
  color: var(--color-text-inverse);
  font-size: var(--font-size-lg);
  cursor: pointer;
}

.modal-body {
  padding: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-4);
  position: relative;
}

.modal-image {
  max-width: 70vw;
  max-height: 70vh;
  object-fit: contain;
}

.nav-button {
  background-color: var(--color-bg-primary);
  border: var(--border-primary);
  padding: var(--space-2) var(--space-4);
  cursor: pointer;
  font-size: var(--font-size-lg);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-footer {
  padding: var(--space-2) var(--space-4);
  text-align: center;
  border-top: var(--border-primary);
}
</style> 