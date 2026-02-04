import api from './api'
import config from '@/config/env'

export const postsService = {
  // Get all posts
  async getAllPosts(params = {}) {
    if (!config.posts.enabled) {
      // Return empty array for static deployments without backend
      return []
    }
    const { limit = 1000, skip = 0, sort_by = 'createdAt', ascending = false } = params
    return api.get('/posts', {
      params: { limit, skip, sort_by, ascending }
    })
  },

  // Get post by ID
  async getPostById(id) {
    return api.get(`/posts/${id}`)
  },

  // Create a new post
  async createPost(postData) {
    if (!config.posts.enabled) {
      throw new Error('Posts feature requires a backend API. Not available in static deployment.')
    }
    return api.post('/posts', postData)
  },

  // Update a post
  async updatePost(id, postData) {
    if (!config.posts.enabled) {
      throw new Error('Posts feature requires a backend API. Not available in static deployment.')
    }
    return api.put(`/posts/${id}`, postData)
  },

  // Delete a post
  async deletePost(id) {
    if (!config.posts.enabled) {
      throw new Error('Posts feature requires a backend API. Not available in static deployment.')
    }
    return api.delete(`/posts/${id}`)
  },

  // Search posts
  async searchPosts(query, limit = 100) {
    return api.get('/posts/search', {
      params: { q: query, limit }
    })
  },

  // Get posts by category
  async getPostsByCategory(category, limit = 100) {
    return api.get(`/posts/category/${category}`, {
      params: { limit }
    })
  },

  // Add groups to post
  async addGroupsToPost(postId, groupIds) {
    return api.post(`/posts/${postId}/groups`, { group_ids: groupIds })
  },

  // Remove groups from post
  async removeGroupsFromPost(postId, groupIds) {
    return api.delete(`/posts/${postId}/groups`, {
      data: { group_ids: groupIds }
    })
  }
}