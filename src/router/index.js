import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('@/views/AboutView.vue')
  },
  {
    path: '/posts',
    name: 'posts',
    component: () => import('@/views/PostsView.vue')
  },
  {
    path: '/posts/all',
    name: 'all-posts',
    component: () => import('@/views/AllPostsView.vue')
  },
  {
    path: '/posts/groups',
    name: 'posts-by-group',
    component: () => import('@/views/PostsByGroupView.vue')
  },
  {
    path: '/photos',
    name: 'photos',
    component: () => import('@/views/PhotosView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router