<template>
  <SectionLayout title="by me" :loading="loading" :empty="items.length === 0">
    <template #empty>
      <p>No projects shared yet.</p>
    </template>

    <div class="explorer-view">
      <div class="explorer-header">
        <span class="col-icon"></span>
        <span class="col-name header-cell">Name</span>
        <span class="col-description header-cell">Description</span>
        <span class="col-date header-cell">Date</span>
        <span class="col-links"></span>
      </div>
      <div class="explorer-rows">
        <div
          v-for="item in items"
          :key="item.url"
          class="explorer-row"
          @click="openUrl(item.url)"
        >
          <div class="col-icon">
            <img
              :src="`/assets/${item.icon || 'connected_world.png'}`"
              :alt="item.title"
              class="item-icon"
            >
          </div>
          <div class="col-name">{{ item.title }}</div>
          <div class="col-description">{{ item.description }}</div>
          <div class="col-date">{{ formatDate(item.creationDate) }}</div>
          <div class="col-links">
            <a
              v-if="item.repositoryUrl"
              :href="item.repositoryUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="repo-link"
              title="View repository"
              @click.stop
            >
              <img src="/assets/directory_docs.png" alt="Repository" class="repo-icon">
            </a>
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
  name: 'ByMeView',
  components: {
    SectionLayout
  },
  setup() {
    const { items, loading } = useJsonLoader('/by-me.json')

    const openUrl = (url) => {
      window.open(url, '_blank', 'noopener,noreferrer')
    }

    const formatDate = (dateStr) => {
      if (!dateStr) return ''
      const [year, month, day] = dateStr.split('-').map(Number)
      const date = new Date(year, month - 1, day)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    return {
      items,
      loading,
      openUrl,
      formatDate
    }
  }
}
</script>

<style scoped>
.explorer-view {
  border: 2px solid;
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
  background-color: var(--color-bg-secondary);
}

.explorer-header {
  display: flex;
  align-items: stretch;
  background-color: var(--color-bg-primary);
  border-bottom: 2px solid;
  border-bottom-color: var(--border-inset-top);
}

.header-cell {
  display: flex;
  align-items: center;
  padding: 2px var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: bold;
  border-right: 2px solid;
  border-right-color: var(--border-inset-top);
  background-color: var(--color-bg-primary);
  border-top: 2px solid;
  border-top-color: var(--border-raised-top);
  border-left: 2px solid;
  border-left-color: var(--border-raised-left);
  border-bottom: 2px solid;
  border-bottom-color: var(--border-raised-bottom);
}

.explorer-rows {
  background-color: var(--color-bg-secondary);
}

.explorer-row {
  display: flex;
  align-items: center;
  min-height: 80px;
  cursor: pointer;
  border-bottom: 1px solid var(--color-gray-200, #dfdfdf);
  user-select: none;
  padding: var(--space-2) 0;
}

.explorer-row:hover {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
}

.explorer-row:hover .repo-link {
  background-color: var(--color-bg-primary);
}

.col-icon {
  width: 40px;
  min-width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
}

.item-icon {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.col-name {
  flex: 1;
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-description {
  flex: 2;
  min-width: 0;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed, 1.5);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.col-date {
  width: 120px;
  min-width: 120px;
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
  text-align: right;
}

.col-links {
  width: 48px;
  min-width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-2);
}

.repo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: 2px solid;
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
  background-color: var(--color-bg-primary);
}

.repo-link:active {
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
}

.repo-icon {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

@media (max-width: 768px) {
  .col-description,
  .col-date {
    display: none;
  }

  .col-name {
    flex: 1;
  }

  .explorer-header .col-description,
  .explorer-header .col-date {
    display: none;
  }
}
</style>
