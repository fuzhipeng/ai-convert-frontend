import { createRouter, createWebHistory } from 'vue-router'

// 定义路由组件
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../pages/home/index.vue'),
    meta: {
      title: 'AI文档转换 - 一键提取文章精华',
      keepAlive: true
    }
  },
  // 添加错误页面路由
  {
    path: '/error',
    name: 'Error',
    component: () => import('../pages/error/index.vue'),
    meta: {
      title: '出错了 - AI文档转换',
      keepAlive: false
    }
  },
  // 捕获所有未匹配路由
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  // 使用带BASE_URL的Web历史模式
  history: createWebHistory(import.meta.env.BASE_URL || ''),
  routes,
  // 添加滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 全局前置守卫，处理页面标题和分析
router.beforeEach((to, from, next) => {
  try {
    // 设置页面标题
    if (to.meta.title) {
      document.title = to.meta.title
    }
    
    // 在这里添加路由级错误处理
    if (to.name === 'Error') {
      console.warn('导航到错误页面:', to.query.message || '未知错误')
    }
    
    next()
  } catch (error) {
    console.error('路由导航时出错:', error)
    next('/error?message=' + encodeURIComponent('导航过程中发生错误'))
  }
})

// 全局错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 如果是组件加载失败，可以重定向到错误页面
  if (error.message.includes('Failed to load module') || error.message.includes('Failed to fetch dynamically imported module')) {
    router.push('/error?message=' + encodeURIComponent('页面加载失败，请刷新重试'))
  }
})

export default router 