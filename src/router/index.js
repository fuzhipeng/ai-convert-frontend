import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../pages/home/index.vue'
// 暂时注释掉不存在的组件，避免报错
// import DashboardView from '../views/dashboard/index.vue'
import LoginView from '../views/Login.vue'
// import RegisterView from '../views/register/index.vue'
// import ForgotPasswordView from '../views/forgot-password/index.vue'
import PricingView from '../pages/pricing/index.vue'
// import AboutView from '../views/about/index.vue'
import SettingsView from '../pages/settings/index.vue'
import PaymentSuccessView from '../pages/payment/success.vue'
import PaymentCancelView from '../pages/payment/cancel.vue'
// 引入一个错误页面作为临时替代
import ErrorView from '../pages/error/index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      // 临时使用错误页面替代
      component: ErrorView,
      meta: { requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      // 临时使用错误页面替代
      component: ErrorView
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      // 临时使用错误页面替代
      component: ErrorView
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: PricingView
    },
    {
      path: '/about',
      name: 'about',
      // 临时使用错误页面替代
      component: ErrorView
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/payment/success',
      name: 'payment-success',
      component: PaymentSuccessView,
      meta: { requiresAuth: true }
    },
    {
      path: '/payment/cancel',
      name: 'payment-cancel',
      component: PaymentCancelView,
      meta: { requiresAuth: true }
    }
  ]
})

// 导航守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

export default router 