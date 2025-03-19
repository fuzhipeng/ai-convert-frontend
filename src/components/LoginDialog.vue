<template>
  <el-dialog
    v-model="visible"
    title="登录"
    width="400px"
    :close-on-click-modal="false"
    class="login-dialog dark-theme"
  >
    <div class="login-content">
      <h3 class="subtitle">登录您的账户</h3>
      
      <div v-if="!isScriptLoaded" class="loading-state">
        加载中...
      </div>
      
      <div v-else>
        <button 
          class="google-login-btn"
          @click="handleGoogleLogin"
        >
          <img :src="googleIcon" alt="Google" class="google-icon">
          使用Google登录
        </button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const visible = ref(false)
const isScriptLoaded = ref(false)

// Google OAuth客户端ID
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

// Google图标的base64编码
const googleIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHBhdGggZmlsbD0iI0VBNDMzNSIgZD0iTTI0IDkuNWMzLjU0IDAgNi43MSAxLjIyIDkuMjEgMy42bDYuODUtNi44NUMzNS45IDIuMzggMzAuNDcgMCAyNCAwIDE0LjYyIDAgNi41MSA1LjM4IDIuNTYgMTMuMjJsNy45OCA2LjE5QzEyLjQzIDEzLjcyIDE3Ljc0IDkuNSAyNCA5LjV6Ii8+PHBhdGggZmlsbD0iIzQyODVGNCIgZD0iTTQ2Ljk4IDI0LjU1YzAtMS41Ny0uMTUtMy4wOS0uMzgtNC41NUgyNHY5LjAyaDEyLjk0Yy0uNTggMi45Ni0yLjI2IDUuNDgtNC43OCA3LjE4bDcuNzMgNmM0LjUxLTQuMTggNy4wOS0xMC4zNiA3LjA5LTE3LjY1eiIvPjxwYXRoIGZpbGw9IiNGQkJDMDUiIGQ9Ik0xMC41MyAyOC41OWMtLjQ4LTEuNDUtLjc2LTIuOTktLjc2LTQuNTlzLjI3LTMuMTQuNzYtNC41OWwtNy45OC02LjE5Qy45MiAxNi40NiAwIDIwLjEyIDAgMjRjMCAzLjg4LjkyIDcuNTQgMi41NiAxMC43OGw3Ljk3LTYuMTl6Ii8+PHBhdGggZmlsbD0iIzM0QTg1MyIgZD0iTTI0IDQ4YzYuNDggMCAxMS45My0yLjEzIDE1Ljg5LTUuODFsLTcuNzMtNmMtMi4xNSAxLjQ5LTQuOTIgMi4zLTguMTYgMi4zLTYuMjYgMC0xMS41Ny00LjIyLTEzLjQ3LTkuOTFsLTcuOTggNi4xOUM2LjUxIDQyLjYyIDE0LjYyIDQ4IDI0IDQ4eiIvPjwvc3ZnPg=='

// 声明全局类型
declare global {
  interface Window {
    google?: any
  }
}

// 处理Google登录
const handleGoogleLogin = () => {
  // 本地开发环境下模拟Google登录
  if (import.meta.env.DEV) {
    console.log('使用模拟的Google登录流程')
    
    // 模拟Google返回的用户信息
    const mockGoogleResponse = {
      credential: 'mock_id_token',
      clientId: clientId,
      select_by: 'btn',
      user: {
        email: 'test@example.com',
        name: '测试用户',
        picture: 'https://lh3.googleusercontent.com/a/default-user'
      }
    }

    // 调用回调函数处理模拟响应
    handleGoogleCallback(mockGoogleResponse)
    return
  }

  if (!window.google) {
    ElMessage.error('Google登录服务未加载')
    return
  }

  try {
    console.log('Current origin:', window.location.origin)
    console.log('Using client ID:', clientId)

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleGoogleCallback,
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      ux_mode: 'popup',
      use_fedcm_for_prompt: false,
      prompt_parent_id: 'g_id_onload',
      state_cookie_domain: window.location.hostname,
      native_callback: (response: any) => {
        console.log('Native callback response:', response)
      }
    })

    // 清理旧的容器（如果存在）
    const oldContainer = document.getElementById('g_id_onload')
    if (oldContainer) {
      oldContainer.remove()
    }

    // 渲染一个隐藏的容器用于Google登录
    const container = document.createElement('div')
    container.id = 'g_id_onload'
    container.style.display = 'none'
    document.body.appendChild(container)

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed()) {
        console.error('Google Sign-In prompt not displayed:', notification.getNotDisplayedReason())
        console.error('Moment type:', notification.getMomentType())
        if (notification.getNotDisplayedReason() === 'unregistered_origin') {
          ElMessage.error('当前域名未在Google Cloud Console中注册，请联系管理员')
        }
      } else if (notification.isSkippedMoment()) {
        console.log('Google Sign-In prompt skipped:', notification.getSkippedReason())
      } else if (notification.isDismissedMoment()) {
        console.log('Google Sign-In prompt dismissed:', notification.getDismissedReason())
      }
    })
  } catch (error) {
    console.error('Failed to initialize Google Sign-In:', error)
    ElMessage.error('Google登录初始化失败')
  }
}

// 处理Google登录回调
const handleGoogleCallback = async (response: any) => {
  try {
    console.log('Received Google response:', response)
    
    // 获取ID Token
    const idToken = response.credential
    
    // 发送ID Token到后端验证
    const apiResponse = await axios.post('/api/auth/google', {
      idToken: idToken
    })
    
    if (apiResponse.data.success) {
      // 存储用户信息
      const userData = {
        id: apiResponse.data.user.id || 'test_user_id',
        email: apiResponse.data.user.email || 'test@example.com',
        name: apiResponse.data.user.name || '测试用户',
        picture: apiResponse.data.user.picture || 'https://lh3.googleusercontent.com/a/default-user'
      }
      
      // 存储用户信息和token
      if (apiResponse.data.token) {
        await userStore.setToken(apiResponse.data.token)
      }
      await userStore.setUser(userData)
      
      // 确认登录状态
      if (userStore.isAuthenticated) {
        // 关闭登录弹窗
        close()
        
        // 显示成功消息
        ElMessage.success('登录成功')
        
        // 跳转到设置页面
        router.push('/settings')
      } else {
        throw new Error('登录状态验证失败')
      }
    } else {
      throw new Error(apiResponse.data.message || '登录失败')
    }
  } catch (error) {
    console.error('Login error:', error)
    
    // 在开发环境下，如果后端API调用失败，使用模拟数据
    if (import.meta.env.DEV) {
      console.log('使用模拟的用户数据')
      
      const mockUserData = {
        id: 'test_user_id',
        email: 'test@example.com',
        name: '测试用户',
        picture: 'https://lh3.googleusercontent.com/a/default-user'
      }
      
      // 在开发环境下的模拟登录
      await userStore.setToken('mock_token_123')
      await userStore.setUser(mockUserData)
      
      // 确认登录状态
      if (userStore.isAuthenticated) {
        close()
        ElMessage.success('模拟登录成功')
        router.push('/settings')
      } else {
        throw new Error('模拟登录状态验证失败')
      }
      return
    }
    
    ElMessage.error('登录失败,请重试')
  }
}

onMounted(() => {
  // 动态加载Google Sign-In脚本
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.defer = true
  script.onload = () => {
    console.log('Google Sign-In script loaded')
    isScriptLoaded.value = true
  }
  script.onerror = (error) => {
    console.error('Failed to load Google Sign-In script:', error)
    ElMessage.error('Google登录服务加载失败')
  }
  document.head.appendChild(script)
})

// 打开弹窗方法
const open = () => {
  visible.value = true
}

// 关闭弹窗方法
const close = () => {
  visible.value = false
}

// 暴露方法供父组件调用
defineExpose({
  open,
  close
})
</script>

<style>
/* 增加全局样式以覆盖element-plus的默认样式 */
.dark-theme.el-dialog {
  background: #141414 !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  margin-top: 15vh !important;
}

.dark-theme .el-dialog__header {
  background: #141414 !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
  margin-right: 0;
}

.dark-theme .el-dialog__title {
  color: #ffffff !important;
}

.dark-theme .el-dialog__headerbtn .el-dialog__close {
  color: #ffffff !important;
}

.dark-theme .el-dialog__body {
  background: #141414 !important;
  color: #ffffff !important;
}

.login-content {
  padding: 20px;
  text-align: center;
}

.subtitle {
  margin-bottom: 24px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}

.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 12px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.google-login-btn:hover {
  background: #f5f5f5;
}

.google-icon {
  width: 18px;
  height: 18px;
  margin-right: 12px;
}

.loading-state {
  padding: 20px;
  color: #ffffff;
}
</style> 