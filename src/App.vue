<template>
  <div class="app-container">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-left">
        <h1 class="app-title">AI文档提取</h1>
      </div>
      <div class="header-right">
        <!-- 未登录时显示登录按钮 -->
        <template v-if="!userStore.isAuthenticated">
          <el-button type="primary" @click="showLoginDialog">登录</el-button>
        </template>
        <!-- 已登录时显示用户信息 -->
        <template v-else>
          <el-dropdown trigger="click" @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32" :src="userStore.userAvatar" />
              <span class="username">{{ userStore.userName }}</span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </header>
    
    <!-- 主要内容区域 -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 登录弹窗组件 -->
    <login-dialog ref="loginDialog" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/user'
import LoginDialog from './components/LoginDialog.vue'
import { ElMessage } from 'element-plus'
import { Setting, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()
const loginDialog = ref()

// 添加调试日志
console.log('App组件初始化')

onMounted(() => {
  // 添加用户状态监听（调试用）
  console.log('当前用户认证状态:', {
    isAuthenticated: userStore.isAuthenticated,
    userName: userStore.userName,
    userAvatar: userStore.userAvatar
  })
})

// 显示登录弹窗
const showLoginDialog = () => {
  loginDialog.value?.open()
}

// 处理下拉菜单命令
const handleCommand = (command: string) => {
  console.log('下拉菜单命令:', command)
  
  switch (command) {
    case 'settings':
      goToSettings()
      break
    case 'logout':
      handleLogout()
      break
  }
}

// 处理退出登录
const handleLogout = () => {
  userStore.clearUser()
  ElMessage.success('已退出登录')
  router.push('/')
}

// 处理设置按钮点击
const goToSettings = () => {
  console.log('点击设置按钮')
  console.log('用户认证状态:', userStore.isAuthenticated)
  console.log('当前路由:', router.currentRoute.value.path)
  
  if (userStore.isAuthenticated) {
    console.log('用户已登录，正在导航到设置页面')
    router.push('/settings').catch(err => {
      console.error('导航失败:', err)
    })
  } else {
    console.log('用户未登录，显示登录对话框')
    showLoginDialog()
  }
}
</script>

<style>
/* 全局样式 */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
  background-color: #141414;
  color: #ffffff;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 64px;
  background-color: #1f1f1f;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
}

.app-title {
  margin: 0;
  font-size: 20px;
  color: #ffffff;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.username {
  margin-left: 8px;
  color: #ffffff;
  font-size: 14px;
}

.app-main {
  flex: 1;
  padding-top: 64px; /* 为固定的header留出空间 */
  min-height: calc(100vh - 64px);
}

/* Element Plus 暗色主题覆盖 */
.el-dropdown-menu {
  background-color: #1f1f1f !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  padding: 4px 0 !important;
}

.el-dropdown-menu__item {
  color: #ffffff !important;
  padding: 8px 16px !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.el-dropdown-menu__item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.el-dropdown-menu__item .el-icon {
  font-size: 16px !important;
  margin-right: 4px !important;
}

.el-button {
  border-color: #4a4a4a !important;
}

.el-button--primary {
  background-color: #409eff !important;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 