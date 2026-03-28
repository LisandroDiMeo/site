<template>
  <SectionLayout title="wishlist" :loading="loading" :empty="items.length === 0">
    <template #empty>
      <p>No items in the wishlist yet.</p>
    </template>

    <div class="wishlist-grid">
      <div v-for="item in items" :key="item.id" class="wishlist-card">
        <div v-if="item.image" class="card-image">
          <img :src="item.image" :alt="item.title">
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-description">{{ item.description }}</p>
          <div v-if="item.links && item.links.length > 0" class="card-links">
            <a
              v-for="(link, index) in item.links"
              :key="index"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="link-button"
            >{{ link.name }}</a>
          </div>
        </div>
      </div>
    </div>
  </SectionLayout>
</template>

<script>
import SectionLayout from '@/components/common/SectionLayout.vue'
import { useJsonLoader } from '@/composables/useJsonLoader'

export default {
  name: 'WishlistView',
  components: {
    SectionLayout
  },
  setup() {
    const { items, loading } = useJsonLoader('/wishlist.json')

    return {
      loading,
      items
    }
  }
}
</script>

<style scoped>
.wishlist-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.wishlist-card {
  display: flex;
  flex-direction: row;
  background-color: var(--color-bg-primary);
  border: 2px solid;
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
}

.card-image {
  position: relative;
  width: 150px;
  min-width: 150px;
  padding-top: 150px;
  overflow: hidden;
  border-right: 2px solid;
  border-right-color: var(--border-inset-top);
}

.card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-body {
  flex: 1;
  padding: var(--space-4);
}

.card-title {
  font-size: var(--font-size-md);
  font-weight: bold;
  margin-bottom: var(--space-2);
}

.card-description {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin-bottom: var(--space-4);
}

.card-links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.link-button {
  display: inline-block;
  padding: 2px var(--space-3);
  background-color: var(--color-bg-primary);
  border: 2px solid;
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
  font-size: var(--font-size-sm);
  font-family: inherit;
  color: var(--color-text-primary);
  text-decoration: none;
  cursor: pointer;
}

.link-button:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.link-button:active {
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
}

@media (max-width: 768px) {
  .wishlist-card {
    flex-direction: column;
  }

  .card-image {
    width: 100%;
    min-width: unset;
    border-right: none;
    border-bottom: 2px solid;
    border-bottom-color: var(--border-inset-top);
  }
}
</style>
