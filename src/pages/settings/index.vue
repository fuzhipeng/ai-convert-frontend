<template>
  <div class="settings-page">
    <h1 class="page-title">设置</h1>
    
    <div class="settings-content">
      <div class="settings-section">
        <h2 class="section-title">个人信息</h2>
        <div class="user-info">
          <el-avatar :size="64" :src="userStore.userAvatar" />
          <div class="user-details">
            <div class="user-name">{{ userStore.userName }}</div>
            <div class="user-email">{{ userStore.userEmail }}</div>
          </div>
        </div>
      </div>

      <div class="settings-section">
        <h2 class="section-title">账户信息</h2>
        <div class="account-info">
          <div class="info-item">
            <span class="label">剩余积分</span>
            <span class="value">{{ userStore.userPoints || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.settings-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
  color: #ffffff;
}

.settings-content {
  background: #1f1f1f;
  border-radius: 8px;
  overflow: hidden;
}

.settings-section {
  padding: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #ffffff;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
}

.user-email {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

.account-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.info-item .label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
}

.info-item .value {
  color: #ffffff;
  font-size: 16px;
  font-weight: 500;
}
</style> 