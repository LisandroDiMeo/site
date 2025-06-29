<template>
  <WindowFrame title="all notes">
    <NavigationBar @back="goBack" />
    
    <div v-if="loading" class="loading-header">
      <img src="/assets/hourglass.gif" alt="Loading" class="loading-icon">
    </div>
    
    <h3>All Notes</h3>
    
    <NotesList 
      :notes="notes"
      :loading="loading"
      :show-actions="true"
      :show-pagination="true"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </WindowFrame>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import NotesList from '@/components/notes/NotesList.vue'

export default {
  name: 'AllNotesView',
  components: {
    WindowFrame,
    NavigationBar,
    NotesList
  },
  setup() {
    const router = useRouter()
    const notesStore = useNotesStore()
    const loading = ref(true)
    
    const notes = ref([])
    
    onMounted(async () => {
      loading.value = true
      // Simulate loading delay to show hourglass
      setTimeout(async () => {
        await notesStore.fetchNotes()
        notes.value = notesStore.notes
        loading.value = false
      }, 1000)
    })
    
    const goBack = () => {
      router.push({ name: 'notes' })
    }
    
    const handleEdit = (noteId) => {
      // TODO: Implement edit functionality
      console.log('Edit note:', noteId)
    }
    
    const handleDelete = async (noteId) => {
      if (confirm('Are you sure you want to delete this note?')) {
        try {
          await notesStore.deleteNote(noteId)
          notes.value = notesStore.notes
        } catch (error) {
          alert('Error deleting note')
        }
      }
    }
    
    return {
      notes,
      loading,
      goBack,
      handleEdit,
      handleDelete
    }
  }
}
</script>

<style scoped>
.loading-header {
  position: absolute;
  top: var(--space-8);
  right: var(--space-6);
}

.loading-icon {
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  image-rendering: pixelated;
}

h3 {
  font-size: var(--font-size-md);
  margin: var(--space-5) 0;
  font-weight: var(--font-weight-bold);
}
</style>