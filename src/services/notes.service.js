import api from './api'

export const notesService = {
  // Get all notes
  async getAllNotes(params = {}) {
    const { limit = 1000, skip = 0, sort_by = 'createdAt', ascending = false } = params
    return api.get('/notes', {
      params: { limit, skip, sort_by, ascending }
    })
  },

  // Get note by ID
  async getNoteById(id) {
    return api.get(`/notes/${id}`)
  },

  // Create a new note
  async createNote(noteData) {
    return api.post('/notes', noteData)
  },

  // Update a note
  async updateNote(id, noteData) {
    return api.put(`/notes/${id}`, noteData)
  },

  // Delete a note
  async deleteNote(id) {
    return api.delete(`/notes/${id}`)
  },

  // Search notes
  async searchNotes(query, limit = 100) {
    return api.get('/notes/search', {
      params: { q: query, limit }
    })
  },

  // Get notes by category
  async getNotesByCategory(category, limit = 100) {
    return api.get(`/notes/category/${category}`, {
      params: { limit }
    })
  },

  // Add groups to note
  async addGroupsToNote(noteId, groupIds) {
    return api.post(`/notes/${noteId}/groups`, { group_ids: groupIds })
  },

  // Remove groups from note
  async removeGroupsFromNote(noteId, groupIds) {
    return api.delete(`/notes/${noteId}/groups`, {
      data: { group_ids: groupIds }
    })
  }
}