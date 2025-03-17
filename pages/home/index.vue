<template>
  <div class="home">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <router-link to="/" class="logo">
          <img src="@/assets/logo.png" alt="Logo">
          <span>AI文档转换</span>
        </router-link>
        <nav class="nav-menu">
          <router-link to="/features">功能</router-link>
          <router-link to="/faq">常见问题</router-link>
          <router-link to="/pricing">定价</router-link>
        </nav>
      </div>
      <div class="header-right">
        <el-dropdown class="language-dropdown">
          <span class="el-dropdown-link">
            简体中文 <el-icon><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>简体中文</el-dropdown-item>
              <el-dropdown-item>English</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" class="login-btn">登录</el-button>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="main-content">
      <div class="hero-section">
        <h1>几秒钟内将任何文档转换为精美的HTML</h1>
        <p class="subtitle">✨ 世界首个免费无限制的AI文档转换器 ✨</p>
        <div class="feature-tags">
          <span class="tag">100% 免费</span>
          <span class="tag">由 Claude AI 提供支持</span>
          <span class="tag">无需注册</span>
          <span class="tag">无限转换</span>
        </div>
      </div>

      <!-- 文件上传和转换区域 -->
      <div class="convert-section">
        <div class="upload-area" 
             @drop.prevent="handleDrop"
             @dragover.prevent
             @click="triggerFileInput">
          <input
            type="file"
            ref="fileInput"
            class="file-input"
            @change="handleFileChange"
            accept=".pdf,.doc,.docx,.txt"
            hidden
          >
          <div v-if="!converting" class="upload-placeholder">
            <el-icon class="upload-icon"><upload-filled /></el-icon>
            <h3>拖放文件到这里，或点击上传</h3>
            <p>支持 PDF、Word、TXT 等格式</p>
          </div>
          <div v-else class="converting-status">
            <div class="file-info">
              <el-icon><document /></el-icon>
              <span class="filename">{{ currentFile.name }}</span>
              <span class="filesize">{{ formatFileSize(currentFile.size) }}</span>
            </div>
            <el-progress 
              :percentage="convertProgress"
              :status="convertStatus"
            />
            <div class="convert-actions">
              <el-button v-if="convertStatus === 'exception'" 
                        type="primary" 
                        @click="retryConvert">
                重试
              </el-button>
              <el-button v-if="convertStatus !== 'success'" 
                        @click="cancelConvert">
                取消
              </el-button>
            </div>
          </div>
        </div>

        <!-- 转换结果预览 -->
        <div v-if="showPreview" class="preview-area">
          <div class="preview-header">
            <h3>转换结果预览</h3>
            <div class="preview-actions">
              <el-button type="primary" @click="downloadHtml">
                下载HTML
              </el-button>
              <el-button @click="copyHtml">
                复制HTML
              </el-button>
            </div>
          </div>
          <div class="preview-content" v-html="previewHtml"></div>
        </div>
      </div>

      <!-- 功能特点展示 -->
      <div class="features-section">
        <h2>AI文档转换的主要功能</h2>
        <p class="features-subtitle">体验下一代 AI 文档转换 - 强大、免费且无限制</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <el-icon class="feature-icon"><money /></el-icon>
            <h3>零成本使用</h3>
            <p>完全免费的AI文档转换器，没有使用限制或注册要求。</p>
          </div>
          
          <div class="feature-card">
            <el-icon class="feature-icon"><star /></el-icon>
            <h3>卓越的质量</h3>
            <p>由Claude AI提供支持，确保最高质量的转换结果。</p>
          </div>
          
          <div class="feature-card">
            <el-icon class="feature-icon"><reading /></el-icon>
            <h3>智能排版理解</h3>
            <p>准确识别文档结构，保持原始格式和样式。</p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Money, Star, Reading } from '@element-plus/icons-vue'

// 文件上传相关
const fileInput = ref(null)
const currentFile = ref(null)
const converting = ref(false)
const convertProgress = ref(0)
const convertStatus = ref('')
const showPreview = ref(false)
const previewHtml = ref('')

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    startConvert(file)
  }
}

// 处理拖放
const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file) {
    startConvert(file)
  }
}

// 开始转换
const startConvert = async (file) => {
  currentFile.value = file
  converting.value = true
  convertProgress.value = 0
  convertStatus.value = ''
  showPreview.value = false

  try {
    // 创建 FormData
    const formData = new FormData()
    formData.append('file', file)

    // 初始化上传
    const initResponse = await fetch('/api/files/init', {
      method: 'POST',
      body: formData
    })

    if (!initResponse.ok) {
      throw new Error('文件上传初始化失败')
    }

    const initResult = await initResponse.json()
    const fileId = initResult.data.id

    // 创建转换任务
    const convertResponse = await fetch('/api/convert/task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileId: fileId
      })
    })

    if (!convertResponse.ok) {
      throw new Error('创建转换任务失败')
    }

    const convertResult = await convertResponse.json()
    const taskId = convertResult.data.taskId

    // 轮询转换进度
    const progressInterval = setInterval(async () => {
      const progressResponse = await fetch(`/api/convert/progress/${taskId}`)
      const progressResult = await progressResponse.json()
      
      convertProgress.value = progressResult.data.progress
      
      if (progressResult.data.status === 'COMPLETED') {
        clearInterval(progressInterval)
        convertStatus.value = 'success'
        
        // 获取转换结果
        const resultResponse = await fetch(`/api/convert/result/${taskId}`)
        const resultData = await resultResponse.json()
        
        previewHtml.value = resultData.data.html
        showPreview.value = true
      } else if (progressResult.data.status === 'FAILED') {
        clearInterval(progressInterval)
        convertStatus.value = 'exception'
        ElMessage.error('转换失败')
      }
    }, 1000)

  } catch (error) {
    console.error('转换失败:', error)
    convertStatus.value = 'exception'
    ElMessage.error(error.message || '转换失败')
  }
}

// 重试转换
const retryConvert = () => {
  if (currentFile.value) {
    startConvert(currentFile.value)
  }
}

// 取消转换
const cancelConvert = () => {
  converting.value = false
  currentFile.value = null
  convertProgress.value = 0
  convertStatus.value = ''
  showPreview.value = false
}

// 下载HTML
const downloadHtml = () => {
  const blob = new Blob([previewHtml.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = currentFile.value.name.replace(/\.[^/.]+$/, '') + '.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 复制HTML
const copyHtml = async () => {
  try {
    await navigator.clipboard.writeText(previewHtml.value)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 格式化文件大小
const formatFileSize = (size) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #e0e0e0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: rgba(0, 0, 0, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: #e0e0e0;
}

.logo img {
  height: 32px;
}

.nav-menu {
  display: flex;
  gap: 1.5rem;
}

.nav-menu a {
  color: #e0e0e0;
  text-decoration: none;
  transition: color 0.3s;
}

.nav-menu a:hover {
  color: #d4a055;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-dropdown {
  color: #e0e0e0;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-section h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  font-size: 1.2rem;
  color: #d4a055;
  margin-bottom: 1.5rem;
}

.feature-tags {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.tag {
  padding: 0.5rem 1rem;
  background-color: rgba(212, 160, 85, 0.1);
  border: 1px solid #d4a055;
  border-radius: 20px;
  font-size: 0.9rem;
}

.convert-section {
  display: flex;
  gap: 2rem;
  margin-bottom: 4rem;
}

.upload-area {
  flex: 1;
  min-height: 300px;
  border: 2px dashed #666;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #d4a055;
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  font-size: 48px;
  color: #666;
  margin-bottom: 1rem;
}

.converting-status {
  width: 100%;
  padding: 2rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.convert-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.preview-area {
  flex: 1;
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 1rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.preview-content {
  height: 500px;
  overflow-y: auto;
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
}

.features-section {
  text-align: center;
  margin-top: 4rem;
}

.features-subtitle {
  color: #888;
  margin-bottom: 3rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  margin-top: 2rem;
}

.feature-card {
  background-color: #2d2d2d;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.feature-icon {
  font-size: 48px;
  color: #d4a055;
  margin-bottom: 1rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.feature-card p {
  color: #888;
}
</style> 