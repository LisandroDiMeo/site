<template>
  <form @submit.prevent="handleSubmit" class="post-form">
    <div class="form-group">
      <label for="post-content">Post Content:</label>
      <textarea 
        id="post-content"
        v-model="formData.content" 
        class="textarea-field" 
        placeholder="text box (old school)"
        required
      ></textarea>
    </div>
    
    <div class="form-group">
      <label for="post-categories">Categories (comma separated):</label>
      <input 
        id="post-categories"
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
  name: 'PostForm',
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
      default: 'Save Post'
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
.post-form {
  background-color: var(--color-bg-primary);
  padding: var(--space-5);
}

.form-group {
  margin-bottom: var(--space-4);
}

label {
  display: block;
  margin-bottom: var(--space-2);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
}

.input-field,
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
}

.textarea-field {
  min-height: 100px;
  resize: vertical;
}

.button-group {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.btn-icon {
  width: var(--icon-size-sm);
  height: var(--icon-size-sm);
  vertical-align: middle;
  image-rendering: pixelated;
}
</style>