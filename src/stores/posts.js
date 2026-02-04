import { defineStore } from 'pinia'
import { postsService } from '@/services/posts.service'

export const usePostsStore = defineStore('posts', {
  state: () => ({
    posts: [],
    currentPost: null,
    loading: false,
    error: null
  }),

  getters: {
    totalPosts: (state) => state.posts.length,
    
    postsByCategory: (state) => (category) => {
      return state.posts.filter(post => 
        post.categories.includes(category)
      )
    },
    
    postsByGroup: (state) => (groupId) => {
      return state.posts.filter(post => 
        post.groups?.some(group => group.id === groupId)
      )
    }
  },

  actions: {
    async fetchPosts() {
      this.loading = true
      this.error = null
      try {
        this.posts = await postsService.getAllPosts()
      } catch (error) {
        this.error = error.message
        console.error('Error fetching posts:', error)
      } finally {
        this.loading = false
      }
    },

    async createPost(postData) {
      try {
        const response = await postsService.createPost(postData)
        await this.fetchPosts() // Refresh the list
        return response
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async deletePost(id) {
      try {
        await postsService.deletePost(id)
        await this.fetchPosts() // Refresh the list
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})