<template>
  <form @submit.prevent="handleSubmit" class="note-form">
    <div class="form-group">
      <label for="note-content">Note Content:</label>
      <textarea 
        id="note-content"
        v-model="formData.content" 
        class="textarea-field" 
        placeholder="text box (old school)"
        required
      ></textarea>
    </div>
    
    <div class="form-group">
      <label for="note-categories">Categories (comma separated):</label>
      <input 
        id="note-categories"
        v-model="categoriesText"
        type="text"
        class="input-field"
        placeholder="e.g. work, personal, todo"
      >
    </div>
    
    <div class="button-group">
      <Button type="submit" :disabled="submitting">
        <img v-if="!submitting" src="/assets/success.png" alt="" class="btn-icon">
        <img v-else src="/assets/hourglass.gif" alt="" class="btn-icon">
        {{ submitLabel }}
      </Button>
      <Button type="button" @click="$emit('cancel')">
        Cancel
      </Button>
    </div>
  </form>
</template>

<script>
import { ref, computed } from 'vue'
import Button from '../common/Button.vue'

export default {
  name: 'NoteForm',
  components: {
    Button
  },
  props: {
    initialData: {
      type: Object,
      default: () => ({
        content: '',
        categories: []
      })
    },
    submitLabel: {
      type: String,
      default: 'Save Note'
    },
    submitting: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const formData = ref({
      content: props.initialData.content || '',
      categories: props.initialData.categories || []
    })
    
    const categoriesText = computed({
      get: () => formData.value.categories.join(', '),
      set: (value) => {
        formData.value.categories = value
          .split(',')
          .map(cat => cat.trim())
          .filter(cat => cat.length > 0)
      }
    })
    
    const handleSubmit = () => {
      if (!formData.value.content.trim()) return
      emit('submit', {
        content: formData.value.content,
        categories: formData.value.categories,
        group_ids: []
      })
    }
    
    return {
      formData,
      categoriesText,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.note-form {
  background-color: #c0c0c0;
  padding: 16px;
}

.form-group {
  margin-bottom: 12px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: bold;
  font-size: 11px;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 4px;
  border: 2px inset #fff;
  background-color: #fff;
  font-family: "MS Sans Serif", Arial, sans-serif;
  font-size: 11px;
  outline: none;
}

.textarea-field {
  min-height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.btn-icon {
  width: 16px;
  height: 16px;
  vertical-align: middle;
  image-rendering: pixelated;
}
</style>