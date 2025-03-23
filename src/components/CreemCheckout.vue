<template>
  <div class="creem-checkout">
    <!-- 添加模拟登录状态显示 -->
    <div class="login-status" v-if="showLoginStatus">
      <p>
        <span class="status-label">登录状态:</span>
        <el-tag :type="userStore.isAuthenticated ? 'success' : 'danger'">
          {{ userStore.isAuthenticated ? '已登录' : '未登录' }}
        </el-tag>
      </p>
      <p v-if="userStore.isAuthenticated">
        <span class="status-label">用户ID:</span> 
        <span class="user-id">{{ userStore.user?.id }}</span>
      </p>
    </div>
    
    <!-- 模拟登录按钮 -->
    <el-button 
      v-if="showLoginButton && !userStore.isAuthenticated" 
      type="primary" 
      size="small" 
      @click="mockLogin"
      class="mock-login-button"
    >
      模拟用户登录
    </el-button>
    
    <!-- 退出登录按钮 -->
    <el-button 
      v-if="showLoginButton && userStore.isAuthenticated" 
      type="info" 
      size="small" 
      @click="mockLogout"
      class="mock-logout-button"
    >
      退出登录
    </el-button>
    
    <!-- 支付按钮 -->
    <el-button 
      :type="buttonType" 
      :loading="loading" 
      @click="initiateCheckout"
      class="checkout-button"
      :class="{ 'checkout-button-plain': plain }"
    >
      {{ loading ? '处理中...' : buttonText }}
    </el-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { createCheckoutSession } from '../api/payment'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const baseUrl = window.location.origin

const props = defineProps({
  productId: {
    type: String,
    required: true
  },
  buttonText: {
    type: String,
    default: '立即支付'
  },
  buttonType: {
    type: String,
    default: 'primary'
  },
  plain: {
    type: Boolean,
    default: false
  },
  metadata: {
    type: Object,
    default: () => ({})
  },
  // 是否显示模拟登录按钮
  showLoginButton: {
    type: Boolean,
    default: false
  },
  // 是否显示登录状态
  showLoginStatus: {
    type: Boolean,
    default: false
  }
})

const successUrl = computed(() => `${baseUrl}/payment/success`)
const cancelUrl = computed(() => `${baseUrl}/payment/cancel`)

const emit = defineEmits(['checkout-started', 'checkout-error'])
const loading = ref(false)

// 模拟登录方法
function mockLogin() {
  const mockUser = {
    id: '1001', // 确保ID能被转换为整数
    name: '测试用户',
    email: 'test@example.com',
    picture: ''  // 移除外部图片URL引用
  }
  
  userStore.setUser(mockUser)
  userStore.setToken('mock_token_' + Date.now())
  
  ElMessage.success('模拟用户登录成功')
}

// 模拟退出登录
function mockLogout() {
  userStore.clearUser()
  ElMessage.info('已退出登录')
}

async function initiateCheckout() {
  loading.value = true
  emit('checkout-started')
  
  try {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    
    // 检查用户是否登录
    if (!userStore.isAuthenticated) {
      throw new Error('请先登录后再进行支付')
    }
    
    const response = await createCheckoutSession({
      productId: props.productId,
      requestId: requestId,
      successUrl: successUrl.value,
      cancelUrl: cancelUrl.value,
      metadata: props.metadata,
      userId: userStore.user?.id ? parseInt(userStore.user.id) : null
    })
    
    console.log('Creem API响应:', response)
    
    if (response && response.checkoutUrl) {
      // 重定向到Creem结账页面
      window.location.href = response.checkoutUrl
    } else {
      throw new Error('创建结账会话失败：返回数据格式不正确')
    }
  } catch (error) {
    console.error('支付初始化错误:', error)
    
    // 显示更详细的错误信息
    let errorMessage = '支付初始化失败，请稍后再试'
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('错误状态:', error.response.status)
      console.error('错误数据:', error.response.data)
      errorMessage = `支付初始化失败 (${error.response.status}): ${error.response.data?.message || '未知错误'}`
    } else if (error.request) {
      // 请求已发送但没有收到响应
      errorMessage = '无法连接到支付服务器，请检查网络连接'
    }
    
    ElMessage.error(errorMessage)
    emit('checkout-error', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.checkout-button {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 6px;
  margin-top: 10px;
}

.checkout-button-plain {
  border: 2px solid #d4a055;
  color: #d4a055;
}

.login-status {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f8f8f8;
  border-radius: 6px;
  font-size: 14px;
}

.status-label {
  font-weight: 500;
  margin-right: 8px;
  color: #555;
}

.user-id {
  font-family: monospace;
  background-color: #eee;
  padding: 2px 6px;
  border-radius: 3px;
}

.mock-login-button, .mock-logout-button {
  margin-bottom: 12px;
}
</style> 