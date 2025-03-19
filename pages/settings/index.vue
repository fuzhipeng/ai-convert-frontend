<template>
  <div class="settings-page">
    <h1 class="page-title">设置</h1>
    
    <div class="settings-content">
      <div class="settings-layout">
        <!-- 左侧个人信息 -->
        <div class="settings-column">
          <div class="settings-section">
            <h2 class="section-title">
              <el-icon><User /></el-icon>
              个人信息
            </h2>
            <div class="user-info">
              <el-avatar :size="64" :src="userStore.userAvatar" />
              <div class="user-details">
                <div class="user-name">{{ userStore.userName || '未知用户' }}</div>
                <div class="user-email">{{ userStore.userEmail || 'user@example.com' }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧套餐信息 -->
        <div class="settings-column">
          <div class="settings-section plan-section">
            <h2 class="section-title">
              <el-icon><Ticket /></el-icon>
              套餐与账单
            </h2>
            
            <div class="current-plan">
              <div class="plan-header">
                <span class="label">当前套餐：</span>
                <span class="value">Free</span>
              </div>
              
              <div class="plan-features">
                <div class="feature-item">
                  <el-icon><Check /></el-icon>
                  <span>无限制图像生成</span>
                </div>
                <div class="feature-item">
                  <el-icon><Check /></el-icon>
                  <span>基础生成速度 (20秒)</span>
                </div>
                <div class="feature-item">
                  <el-icon><Check /></el-icon>
                  <span>基础优化功能</span>
                </div>
              </div>
            </div>
            
            <div class="upgrade-plan">
              <h3 class="upgrade-title">
                <el-icon><Star /></el-icon>
                升级专业版特权
              </h3>
              
              <div class="upgrade-features">
                <div class="feature-item">
                  <el-icon><DataAnalysis /></el-icon>
                  <div class="feature-content">
                    <span class="feature-name">5倍生成速度</span>
                    <span class="feature-desc">图片生成只需4秒，而不是20秒</span>
                  </div>
                </div>
                <div class="feature-item">
                  <el-icon><Picture /></el-icon>
                  <div class="feature-content">
                    <span class="feature-name">无水印</span>
                    <span class="feature-desc">所有生成图片均可商用</span>
                  </div>
                </div>
                <div class="feature-item">
                  <el-icon><Sort /></el-icon>
                  <div class="feature-content">
                    <span class="feature-name">优先生成队列</span>
                    <span class="feature-desc">高峰期跳过等待队列</span>
                  </div>
                </div>
                <div class="feature-item">
                  <el-icon><Lock /></el-icon>
                  <div class="feature-content">
                    <span class="feature-name">私密生成</span>
                    <span class="feature-desc">您生成的图片不会在社区或公开中显示</span>
                  </div>
                </div>
              </div>
              
              <div class="upgrade-pricing">
                升级专业版仅需 <span class="price">$10/月</span> <span class="billing-cycle">(年付)</span>
              </div>
              
              <el-button type="primary" class="upgrade-button">
                立即升级
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../../src/stores/user'
import { User, Ticket, Check, Star, DataAnalysis, Picture, Sort, Lock, ArrowRight } from '@element-plus/icons-vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const userStore = useUserStore()

onMounted(() => {
  console.log('Settings组件已挂载')
  console.log('当前用户状态:', {
    isAuthenticated: userStore.isAuthenticated,
    userName: userStore.userName,
    userAvatar: userStore.userAvatar
  })
  console.log('当前路由:', router.currentRoute.value.path)
})
</script>

<style scoped>
.settings-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: #1a1a1a;
  min-height: calc(100vh - 64px);
  
  @media (max-width: 768px) {
    padding: 10px;
  }
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #ffffff;
}

.settings-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.settings-column {
  flex: 1;
  min-width: 300px;
}

.settings-section {
  background: #222222;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title .el-icon {
  font-size: 18px;
  color: #d4a055;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #2a2a2a;
  border-radius: 8px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.user-name {
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
}

.user-email {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.plan-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.plan-header .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.plan-header .value {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-left: 4px;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
}

.feature-item .el-icon {
  color: #d4a055;
  font-size: 16px;
}

.upgrade-plan {
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.upgrade-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.upgrade-title .el-icon {
  color: #d4a055;
}

.upgrade-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.feature-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.feature-name {
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
}

.feature-desc {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.upgrade-pricing {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 20px;
}

.price {
  font-size: 20px;
  font-weight: 600;
  color: #d4a055;
}

.billing-cycle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.upgrade-button {
  width: 100%;
  background-color: #d4a055;
  border-color: #d4a055;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 40px;
  font-size: 14px;
  
  &:hover {
    background-color: #c2924a;
    border-color: #c2924a;
  }
}

@media (max-width: 768px) {
  .settings-layout {
    flex-direction: column;
  }
  
  .settings-section {
    padding: 16px;
  }
  
  .upgrade-plan {
    padding: 16px;
  }
}
</style> 