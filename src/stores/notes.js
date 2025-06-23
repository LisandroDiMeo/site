import { defineStore } from 'pinia'
import { notesService } from '@/services/notes.service'

export const useNotesStore = defineStore('notes', {
  state: () => ({
    notes: [],
    currentNote: null,
    loading: false,
    error: null
  }),

  getters: {
    totalNotes: (state) => state.notes.length,
    
    notesByCategory: (state) => (category) => {
      return state.notes.filter(note => 
        note.categories.includes(category)
      )
    },
    
    notesByGroup: (state) => (groupId) => {
      return state.notes.filter(note => 
        note.groups?.some(group => group.id === groupId)
      )
    }
  },

  actions: {
    async fetchNotes() {
      this.loading = true
      this.error = null
      try {
        this.notes = await notesService.getAllNotes()
      } catch (error) {
        this.error = error.message
        console.error('Error fetching notes:', error)
      } finally {
        this.loading = false
      }
    },

    async createNote(noteData) {
      try {
        const response = await notesService.createNote(noteData)
        await this.fetchNotes() // Refresh the list
        return response
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deleteNote(id) {
      try {
        await notesService.deleteNote(id)
        await this.fetchNotes() // Refresh the list
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})