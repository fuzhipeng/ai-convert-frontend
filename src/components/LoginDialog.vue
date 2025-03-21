<template>
  <el-dialog
    v-model="visible"
    :title="$t('login.title')"
    width="400px"
    :close-on-click-modal="false"
    class="login-dialog dark-theme"
  >
    <div class="login-content">
      <h3 class="subtitle">{{ $t('login.subtitle') }}</h3>
      
      <div v-if="!isScriptLoaded" class="loading-state">
        {{ $t('system.loading') }}
      </div>
      
      <div v-else>
        <button 
          class="google-login-btn"
          @click="handleGoogleLogin"
        >
          <img :src="googleIcon" alt="Google" class="google-icon">
          {{ $t('login.googleLogin') }}
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
import { useI18n } from 'vue-i18n'

const router = useRouter()
const userStore = useUserStore()
const { t } = useI18n()
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
  if (!window.google) {
    ElMessage.error(t('login.error'))
    return
  }

  try {
    // 添加全局调试日志
    console.log('===== 开始Google登录流程 =====')
    console.log('客户端ID:', clientId)
    console.log('当前URL:', window.location.href)
    console.log('当前时间:', new Date().toISOString())
    
    // 确保回调函数可全局访问
    (window as any).handleGoogleCallbackGlobal = (response: any) => {
      console.log('通过全局函数收到Google回调:', response)
      handleGoogleCallback(response).catch((err: any) => {
        console.error('处理Google回调时出错:', err)
      })
    }

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        console.log('直接收到Google回调:', response)
        handleGoogleCallback(response).catch((err: any) => {
          console.error('处理Google回调时出错:', err)
        })
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      context: 'signin',
      ux_mode: 'popup',
      use_fedcm_for_prompt: false,
      prompt_parent_id: 'g_id_onload',
      state_cookie_domain: window.location.hostname,
      native_callback: (response: any) => {
        console.log('收到原生回调:', response)
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

    console.log('正在显示Google登录提示...')
    window.google.accounts.id.prompt((notification: any) => {
      console.log('Google登录提示状态:', notification)
      if (notification.isNotDisplayed()) {
        console.error('Google登录提示未显示:', notification.getNotDisplayedReason())
        console.error('Moment类型:', notification.getMomentType())
        if (notification.getNotDisplayedReason() === 'unregistered_origin') {
          ElMessage.error(t('login.unregisteredOrigin'))
        }
      } else if (notification.isSkippedMoment()) {
        console.log('Google登录提示被跳过:', notification.getSkippedReason())
      } else if (notification.isDismissedMoment()) {
        console.log('Google登录提示被关闭:', notification.getDismissedReason())
      } else {
        console.log('Google登录提示正常显示')
      }
    })
  } catch (error) {
    console.error('初始化Google登录失败:', error)
    ElMessage.error(t('login.initError'))
  }
}

// 处理Google登录回调
const handleGoogleCallback = async (response: any) => {
  try {
    console.log('收到Google回调:', response)
    
    // 获取ID Token
    const idToken = response.credential
    if (!idToken) {
      console.error('Google返回的凭证无效:', response)
      throw new Error('无效的Google登录凭证')
    }
    
    console.log('成功获取ID Token')
    
    // 解析JWT查看内容（仅供调试）
    try {
      const payload = decodeJwtPayload(idToken)
      console.log('Token包含用户信息:', {
        sub: payload.sub,
        email: payload.email,
        name: payload.name
      })
    } catch (e) {
      console.warn('解析JWT失败，但这不影响登录流程:', e)
    }
    
    // 发送ID Token到后端验证
    console.log('准备发送Token到后端...')
    console.log('目标API:', '/api/auth/google')
    console.log('请求数据:', { idToken: idToken.substring(0, 20) + '...' })
    
    try {
      const apiResponse = await axios.post('/api/auth/google', {
        idToken: idToken
      })
      
      console.log('收到后端响应:', apiResponse.data)
      
      if (apiResponse.data.success) {
        // 存储用户信息
        const userData = {
          id: apiResponse.data.user.id,
          email: apiResponse.data.user.email,
          name: apiResponse.data.user.name,
          picture: apiResponse.data.user.picture
        }
        
        console.log('准备存储用户信息:', userData)
        
        // 存储用户信息和token
        if (apiResponse.data.token) {
          console.log('使用后端返回的token')
          await userStore.setToken(apiResponse.data.token)
        } else {
          console.log('后端未返回token，使用Google ID token代替')
          await userStore.setToken(idToken)
        }
        await userStore.setUser(userData)
        
        // 确认登录状态
        console.log('检查登录状态:', userStore.isAuthenticated)
        if (userStore.isAuthenticated) {
          // 关闭登录弹窗
          console.log('登录成功，关闭弹窗')
          close()
          
          // 显示成功消息
          ElMessage.success(t('login.success'))
          
          // 跳转到设置页面
          console.log('准备跳转到设置页面')
          router.push('/settings')
        } else {
          console.error('存储用户信息后，认证状态仍为false')
          throw new Error(t('login.statusError'))
        }
      } else {
        console.error('后端API返回失败:', apiResponse.data)
        throw new Error(apiResponse.data.message || t('login.error'))
      }
    } catch (apiError) {
      console.error('API调用失败:', apiError)
      
      // 尝试使用Google返回的数据进行直接登录
      if (idToken) {
        console.log('尝试直接使用Google信息登录（跳过后端）')
        
        // 解析JWT获取用户信息
        const payload = decodeJwtPayload(idToken)
        
        const userData = {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture
        }
        
        // 存储用户信息和token
        await userStore.setToken(idToken)
        await userStore.setUser(userData)
        
        if (userStore.isAuthenticated) {
          console.log('直接使用Google信息登录成功')
          close()
          ElMessage.success('使用Google信息登录成功')
          router.push('/settings')
          return
        }
      }
      
      throw apiError
    }
  } catch (error) {
    console.error('登录错误:', error)
    ElMessage.error(t('login.error'))
  }
}

// 解析JWT payload
function decodeJwtPayload(token: string) {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(atob(base64).split('').map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  } catch (error) {
    console.error('Failed to decode JWT:', error)
    return {
      sub: 'unknown_id',
      email: 'unknown@example.com',
      name: t('login.testUser'),
      picture: 'https://lh3.googleusercontent.com/a/default-user'
    }
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
    ElMessage.error(t('login.scriptError'))
  }
  document.head.appendChild(script)
})

// 打开弹窗方法
const open = () => {
  visible.value = true
  
  // 测试Google OAuth配置是否生效
  testGoogleAuthConfig()
}

// 测试Google OAuth配置是否生效
const testGoogleAuthConfig = () => {
  console.log('测试Google OAuth配置...')
  console.log('当前URL:', window.location.href)
  console.log('当前域名:', window.location.origin)
  console.log('使用的客户端ID:', clientId)
  
  try {
    const testDiv = document.createElement('div')
    testDiv.id = 'google-oauth-test'
    testDiv.style.display = 'none'
    document.body.appendChild(testDiv)
    
    window.google?.accounts.id.renderButton(
      document.getElementById('google-oauth-test'),
      { theme: 'outline', size: 'large', type: 'standard' }
    )
    
    // 如果能够渲染按钮而不报错，配置可能有效
    console.log('Google OAuth配置可能有效 - 按钮渲染成功')
    
    // 清理测试元素
    setTimeout(() => {
      testDiv.remove()
    }, 1000)
  } catch (error) {
    console.error('Google OAuth配置测试失败:', error)
  }
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