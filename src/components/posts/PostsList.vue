<template>
  <div class="posts-list">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Loading posts..." />
    </div>
    
    <div v-else-if="posts.length === 0" class="empty-state">
      <p>No posts found.</p>
    </div>
    
    <div v-else>
      <PostItem 
        v-for="post in posts" 
        :key="post.id || post._id"
        :post="post"
        :show-actions="showActions"
        @edit="$emit('edit', $event)"
        @delete="$emit('delete', $event)"
      />
      
      <div v-if="showPagination" class="pagination-info">
        <span>1...{{ displayCount }} ></span>
        <div style="margin-top: 8px;">paginated</div>
      </div>
    </div>
  </div>
</template>

<script>
import PostItem from './PostItem.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'

export default {
  name: 'PostsList',
  components: {
    PostItem,
    LoadingSpinner
  },
  props: {
    posts: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: false
    },
    showPagination: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    displayCount() {
      return this.posts.length > 5 ? 5 : this.posts.length
    }
  }
}
</script>

<style scoped>
.posts-list {
  margin-top: var(--space-5);
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: var(--space-8);
}

.empty-state {
  text-align: center;
  padding: var(--space-8);
  background-color: var(--color-bg-secondary);
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
}

.pagination-info {
  text-align: center;
  margin-top: var(--space-5);
  padding: var(--space-3);
  background-color: var(--color-bg-secondary);
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
  font-size: var(--font-size-sm);
}
</style>