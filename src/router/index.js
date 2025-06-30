// src/router/index.js (Vue 3 compatible)
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/identify',
    name: 'Identify',
    component: () => import('../views/Identify.vue')
  },
  {
    path: '/species',
    name: 'Species',
    component: () => import('../views/Species.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
