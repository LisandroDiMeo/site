import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { section: 'home' }
  },
  {
    path: '/writing',
    name: 'writing',
    component: () => import('@/views/WritingView.vue'),
    meta: { section: 'writing' }
  },
  {
    path: '/writing/:id',
    name: 'article',
    component: () => import('@/views/ArticleView.vue'),
    meta: { section: 'writing' }
  },
  {
    path: '/photos/:pathMatch(.*)*',
    name: 'photos',
    component: () => import('@/views/PhotosView.vue'),
    meta: { section: 'photos' }
  },
  {
    path: '/projects',
    name: 'projects',
    component: () => import('@/views/ProjectsView.vue'),
    meta: { section: 'projects' }
  },
  {
    path: '/hello',
    name: 'hello',
    component: () => import('@/views/HelloView.vue'),
    meta: { section: 'hello' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/NotFoundView.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
