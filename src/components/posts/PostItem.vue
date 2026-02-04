<template>
  <div class="post-item">
    <img src="/assets/postit.png" alt="Post" class="post-icon">
    <div class="post-content">
      <div class="post-text">{{ post.content }}</div>
      <div class="post-categories" v-if="post.categories && post.categories.length > 0">
        categories: {{ post.categories.join(', ') }}
      </div>
      <div class="post-groups" v-if="post.groups && post.groups.length > 0">
        groups: {{ post.groups.map(g => g.name || g).join(', ') }}
      </div>
      <div class="post-date">
        {{ formatDate(post.createdAt) }}
      </div>
    </div>
    <div class="post-actions" v-if="showActions">
      <button class="action-btn" @click="$emit('edit', post.id)">Edit</button>
      <button class="action-btn" @click="$emit('delete', post._id)">Delete</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PostItem',
  props: {
    post: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    }
  }
}
</script>

<style scoped>
.post-item {
  background-color: var(--color-bg-secondary);
  border: var(--border-width-thin) solid var(--color-gray-500);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.post-icon {
  width: var(--icon-size-base);
  height: var(--icon-size-base);
  flex-shrink: 0;
  image-rendering: pixelated;
}

.post-content {
  flex: 1;
}

.post-text {
  margin-bottom: var(--space-3);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-sm);
}

.post-categories {
  margin-top: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.post-groups {
  margin-top: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-primary);
}

.post-date {
  margin-top: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-disabled);
}

.post-actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  background-color: var(--btn-bg);
  border: var(--border-width-thin) solid;
  border-top-color: var(--border-raised-top);
  border-left-color: var(--border-raised-left);
  border-right-color: var(--border-raised-right);
  border-bottom-color: var(--border-raised-bottom);
  padding: var(--space-1) var(--space-3);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: var(--transition-fast);
}

.action-btn:active {
  border-top-color: var(--border-raised-bottom);
  border-left-color: var(--border-raised-bottom);
  border-right-color: var(--border-raised-top);
  border-bottom-color: var(--border-raised-top);
}
</style>