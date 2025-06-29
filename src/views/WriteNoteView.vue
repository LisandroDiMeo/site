<template>
  <WindowFrame title="write note">
    <NavigationBar @back="goBack" />
    
    <h2>Write a note, a //TODO, reminder, whatever!</h2>
    
    <div v-if="!submitted">
      <form @submit.prevent="submitNote">
        <div class="form-group">
          <textarea 
            v-model="noteContent" 
            class="textarea-field" 
            placeholder="note content"
            required
          ></textarea>
        </div>
        <Button type="submit">
          <img src="/assets/success.png" alt="" class="btn-icon">
          Save Note
        </Button>
      </form>
    </div>
    
    <div v-else>
      <LoadingSpinner v-if="saving" message="Saving note..." />
      
      <div v-else class="success-message">
        <img src="/assets/success.png" alt="Success" class="success-icon">
        <span>Note saved successfully!</span>
      </div>
      
      <div class="button-group">
        <Button @click="writeAnother">Write Another Note</Button>
        <Button @click="goToNotes">Back to Notes</Button>
      </div>
    </div>
  </WindowFrame>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useNotesStore } from '@/stores/notes'
import WindowFrame from '@/components/common/WindowFrame.vue'
import NavigationBar from '@/components/common/NavigationBar.vue'
import Button from '@/components/common/Button.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

export default {
  name: 'WriteNoteView',
  components: {
    WindowFrame,
    NavigationBar,
    Button,
    LoadingSpinner
  },
  setup() {
    const router = useRouter()
    const notesStore = useNotesStore()
    
    const noteContent = ref('')
    const submitted = ref(false)
    const saving = ref(false)
    
    const submitNote = async () => {
      if (!noteContent.value.trim()) return
      
      submitted.value = true
      saving.value = true
      
      try {
        await notesStore.createNote({
          content: noteContent.value,
          categories: [],
          group_ids: []
        })
        
        // Show hourglass for a moment before success
        setTimeout(() => {
          saving.value = false
        }, 1500)
      } catch (error) {
        console.error('Error saving note:', error)
        saving.value = false
        submitted.value = false
        alert('Error saving note. Please try again.')
      }
    }
    
    const writeAnother = () => {
      noteContent.value = ''
      submitted.value = false
      saving.value = false
    }
    
    const goBack = () => {
      router.push({ name: 'notes' })
    }
    
    const goToNotes = () => {
      router.push({ name: 'notes' })
    }
    
    return {
      noteContent,
      submitted,
      saving,
      submitNote,
      writeAnother,
      goBack,
      goToNotes
    }
  }
}
</script>

<style scoped>
.form-group {
  margin-bottom: var(--space-4);
}

.textarea-field {
  width: 100%;
  padding: var(--input-padding-y) var(--input-padding-x);
  border: var(--border-inset);
  border-top-color: var(--border-inset-top);
  border-left-color: var(--border-inset-left);
  border-right-color: var(--border-inset-right);
  border-bottom-color: var(--border-inset-bottom);
  background-color: var(--input-bg);
  font-family: var(--input-font-family);
  font-size: var(--input-font-size);
  outline: none;
  min-height: 100px;
  resize: vertical;
}

.success-message {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background-color: var(--color-bg-secondary);
  border: var(--border-width-thin) solid var(--color-gray-500);
  padding: var(--space-5);
  margin: var(--space-6) 0;
}

.success-icon {
  width: var(--icon-size-lg);
  height: var(--icon-size-lg);
  image-rendering: pixelated;
}

.btn-icon {
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
  vertical-align: middle;
  margin-right: var(--space-2);
  image-rendering: pixelated;
}

.button-group {
  display: flex;
  gap: var(--space-3);
}
</style>