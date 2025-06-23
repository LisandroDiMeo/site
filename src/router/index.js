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
    path: '/notes',
    name: 'notes',
    component: () => import('@/views/NotesView.vue')
  },
  {
    path: '/notes/write',
    name: 'write-note',
    component: () => import('@/views/WriteNoteView.vue')
  },
  {
    path: '/notes/all',
    name: 'all-notes',
    component: () => import('@/views/AllNotesView.vue')
  },
  {
    path: '/notes/groups',
    name: 'notes-by-group',
    component: () => import('@/views/NotesByGroupView.vue')
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