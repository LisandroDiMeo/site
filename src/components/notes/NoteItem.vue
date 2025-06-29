<template>
  <div class="note-item">
    <img src="/assets/postit.png" alt="Note" class="note-icon">
    <div class="note-content">
      <div class="note-text">{{ note.content }}</div>
      <div class="note-categories" v-if="note.categories && note.categories.length > 0">
        categories: {{ note.categories.join(', ') }}
      </div>
      <div class="note-groups" v-if="note.groups && note.groups.length > 0">
        groups: {{ note.groups.map(g => g.name || g).join(', ') }}
      </div>
      <div class="note-date">
        {{ formatDate(note.createdAt) }}
      </div>
    </div>
    <div class="note-actions" v-if="showActions">
      <button class="action-btn" @click="$emit('edit', note.id)">Edit</button>
      <button class="action-btn" @click="$emit('delete', note._id)">Delete</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NoteItem',
  props: {
    note: {
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
.note-item {
  background-color: var(--color-bg-secondary);
  border: var(--border-width-thin) solid var(--color-gray-500);
  padding: var(--space-4);
  margin-bottom: var(--space-4);
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
}

.note-icon {
  width: var(--icon-size-base);
  height: var(--icon-size-base);
  flex-shrink: 0;
  image-rendering: pixelated;
}

.note-content {
  flex: 1;
}

.note-text {
  margin-bottom: var(--space-3);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-sm);
}

.note-categories {
  margin-top: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.note-groups {
  margin-top: var(--space-2);
  font-size: var(--font-size-xs);
  color: var(--color-primary);
}

.note-date {
  margin-top: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-disabled);
}

.note-actions {
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