import { createRouter, createWebHistory } from 'vue-router'
import Home from '../../pages/home/index.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/features',
    name: 'Features',
    component: Home
  },
  {
    path: '/faq',
    name: 'FAQ',
    component: Home
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: Home
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 