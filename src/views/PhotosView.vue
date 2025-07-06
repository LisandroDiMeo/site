<template>
  <WindowFrame title="photos">
    <NavigationBar @back="goBack" />
    <div class="blank-content">
      <h2>Photos</h2>
      <IconItem
          v-for="directory in currentDirectories"
          :key="directory"
          icon="/assets/closedfolder.png"
          hoverIcon="/assets/openfolder.png"
          :label="directory"
          @click=""
      />
    </div>
  </WindowFrame>
</template>

<script>
import { useRouter } from 'vue-router'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import IconItem from "@/components/icons/IconItem.vue";

export default {
  name: 'PhotosView',
  components: {
    IconItem,
    WindowFrame,
    NavigationBar
  },
  data() {
    return {
      currentDirectories: []
    }
  },
  setup() {
    const router = useRouter()
    
    const goBack = () => {
      router.push({ name: 'home' })
    }
    
    return {
      goBack
    }
  },
  async mounted() {
    await this.loadPhotoStructure();
  },
  methods: {
    async loadPhotoStructure() {
      try {
        this.loading = true;
        const response = await fetch('/photo-index.json');

        if (!response.ok) {
          throw new Error('Failed to load photo index');
        }

        this.photoStructure = await response.json();
        this.currentDirectories = this.photoStructure.subdirs || [];

      } catch (error) {
        console.error('Failed to load photo structure:', error);
        this.error = 'Failed to load photos. Please try again.';
      } finally {
        this.loading = false;
      }
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
  text-align: center;
}

h2 {
  font-size: var(--font-size-md);
  margin-bottom: var(--space-4);
}

p {
  margin-bottom: var(--space-7);
  color: var(--color-text-secondary);
}

.construction-icon {
  margin-top: var(--space-7);
}

.construction-icon img {
  width: var(--icon-size-xl);
  height: var(--icon-size-xl);
  opacity: 0.5;
  image-rendering: pixelated;
}
</style>