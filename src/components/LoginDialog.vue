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
      
      <button 
        class="google-login-btn"
        @click="handleGoogleLogin"
      >
        <img src="@/assets/google-icon.svg" alt="Google" class="google-icon">
        使用Google登录
      </button>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

const visible = ref(false)

// Google登录处理函数
const handleGoogleLogin = async () => {
  try {
    // TODO: 实现Google OAuth登录逻辑
    window.location.href = '/api/auth/google'
  } catch (error) {
    ElMessage.error('登录失败,请重试')
    console.error('Google login error:', error)
  }
}

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
  padding: 0;
}
</style>

<style scoped>
.login-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  margin-bottom: 30px;
}

.google-login-btn {
  width: 100%;
  height: 44px;
  background: #1f1f1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.3s;
  color: #fff;
  font-size: 14px;
  padding: 0;
  outline: none;
}

.google-login-btn:hover {
  background: #2a2a2a;
  border-color: rgba(255, 255, 255, 0.2);
}

.google-icon {
  width: 18px;
  height: 18px;
}
</style> 