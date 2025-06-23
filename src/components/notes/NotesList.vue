<template>
  <div class="notes-list">
    <div v-if="loading" class="loading-container">
      <LoadingSpinner message="Loading notes..." />
    </div>
    
    <div v-else-if="notes.length === 0" class="empty-state">
      <p>No notes found.</p>
    </div>
    
    <div v-else>
      <NoteItem 
        v-for="note in notes" 
        :key="note.id || note._id"
        :note="note"
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
import NoteItem from './NoteItem.vue'
import LoadingSpinner from '../common/LoadingSpinner.vue'

export default {
  name: 'NotesList',
  components: {
    NoteItem,
    LoadingSpinner
  },
  props: {
    notes: {
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
      return this.notes.length > 5 ? 5 : this.notes.length
    }
  }
}
</script>

<style scoped>
.notes-list {
  margin-top: 16px;
}

.loading-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: #fff;
  border: 1px inset #000;
}

.pagination-info {
  text-align: center;
  margin-top: 16px;
  padding: 8px;
  background-color: #fff;
  border: 1px inset #000;
  font-size: 11px;
}
</style>