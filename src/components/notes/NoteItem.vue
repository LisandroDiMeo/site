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
  background-color: #fff;
  border: 1px solid #000;
  padding: 12px;
  margin-bottom: 12px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.note-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
  image-rendering: pixelated;
}

.note-content {
  flex: 1;
}

.note-text {
  margin-bottom: 8px;
  line-height: 1.4;
}

.note-categories {
  margin-top: 8px;
  font-size: 10px;
  color: #666;
}

.note-groups {
  margin-top: 4px;
  font-size: 10px;
  color: #000080;
}

.note-date {
  margin-top: 8px;
  font-size: 10px;
  color: #808080;
}

.note-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background-color: #c0c0c0;
  border: 1px solid;
  border-top-color: #fff;
  border-left-color: #fff;
  border-right-color: #000;
  border-bottom-color: #000;
  padding: 2px 8px;
  font-size: 10px;
  cursor: pointer;
}

.action-btn:active {
  border-top-color: #000;
  border-left-color: #000;
  border-right-color: #fff;
  border-bottom-color: #fff;
}
</style>