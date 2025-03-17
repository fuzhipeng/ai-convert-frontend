<template>
  <div class="home">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <router-link to="/" class="logo">
          <img src="@/assets/logo.svg" alt="DocSmart">
          <span>DocSmart「文档智」</span>
        </router-link>
        <nav class="nav-menu">
          <a href="#features" @click.prevent="scrollTo('features')">{{ $t('nav.features') }}</a>
          <a href="#faq" @click.prevent="scrollTo('faq')">{{ $t('nav.faq') }}</a>
          <a href="javascript:void(0)" class="disabled">{{ $t('nav.pricing') }}</a>
        </nav>
      </div>
      <div class="header-right">
        <el-dropdown class="language-dropdown" @command="handleLanguageChange" trigger="click">
          <span class="el-dropdown-link">
            {{ currentLanguageLabel }}
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="lang in SUPPORT_LANGUAGES" 
                              :key="lang.value" 
                              :command="lang.value"
                              :class="{ 'is-active': locale === lang.value }">
                {{ lang.label }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-button type="primary" class="login-btn">{{ $t('nav.login') }}</el-button>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="main-content">
      <div class="hero-section">
        <h1>{{ $t('hero.title') }}</h1>
        <p class="subtitle">{{ $t('hero.subtitle') }}</p>
        <div class="feature-tags">
          <span class="tag">{{ $t('hero.tags.free') }}</span>
          <span class="tag">{{ $t('hero.tags.ai') }}</span>
          <span class="tag">{{ $t('hero.tags.noRegister') }}</span>
          <span class="tag">{{ $t('hero.tags.unlimited') }}</span>
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
            <h3>{{ $t('upload.title') }}</h3>
            <p>{{ $t('upload.subtitle') }}</p>
            <el-button type="primary">{{ $t('upload.button') }}</el-button>
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
                {{ $t('upload.retry') }}
              </el-button>
              <el-button v-if="convertStatus !== 'success'" 
                        @click="cancelConvert">
                {{ $t('upload.cancel') }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 转换结果预览 -->
        <div v-if="showPreview" class="preview-area">
          <div class="preview-header">
            <h3>{{ $t('preview.title') }}</h3>
            <div class="preview-actions">
              <el-button type="primary" @click="downloadHtml">
                {{ $t('preview.download') }}
              </el-button>
              <el-button @click="copyHtml">
                {{ $t('preview.copy') }}
              </el-button>
            </div>
          </div>
          <div class="preview-content" v-html="previewHtml"></div>
        </div>
      </div>

      <!-- 功能特点展示 -->
      <div id="features" class="features-section">
        <h2>{{ $t('features.title') }}</h2>
        <p class="features-subtitle">{{ $t('features.subtitle') }}</p>
        
        <div class="features-grid">
          <div class="feature-card">
            <el-icon class="feature-icon"><money /></el-icon>
            <h3>{{ $t('features.cards.free.title') }}</h3>
            <p>{{ $t('features.cards.free.desc') }}</p>
          </div>
          
          <div class="feature-card">
            <el-icon class="feature-icon"><star /></el-icon>
            <h3>{{ $t('features.cards.quality.title') }}</h3>
            <p>{{ $t('features.cards.quality.desc') }}</p>
          </div>
          
          <div class="feature-card">
            <el-icon class="feature-icon"><reading /></el-icon>
            <h3>{{ $t('features.cards.smart.title') }}</h3>
            <p>{{ $t('features.cards.smart.desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 评价和FAQ组件 -->
      <Testimonials />
      <div id="faq">
        <FAQ />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Money, Star, Reading, ArrowDown } from '@element-plus/icons-vue'
import Testimonials from '@/components/Testimonials.vue'
import FAQ from '@/components/FAQ.vue'
import { SUPPORT_LANGUAGES } from '@/i18n'
import { 
  uploadFile,
  createConvertTask,
  getConvertProgress,
  getConversionResult
} from '@/api/convert'

const { t, locale } = useI18n()

// 当前语言标签
const currentLanguageLabel = computed(() => {
  const lang = SUPPORT_LANGUAGES.find(l => l.value === locale.value)
  return lang ? `${lang.icon} ${lang.label}` : ''
})

// 处理语言切换
const handleLanguageChange = (lang) => {
  // 先更新 localStorage
  localStorage.setItem('language', lang)
  // 更新 locale
  locale.value = lang
  const selectedLang = SUPPORT_LANGUAGES.find(l => l.value === lang)
  ElMessage.success(t('system.languageChanged', { lang: selectedLang.label }))
  // 使用 nextTick 等待 DOM 更新
  nextTick(() => {
    // 强制重新加载所有组件
    window.location.reload()
  })
}

// 文件上传相关
const fileInput = ref(null)
const currentFile = ref(null)
const converting = ref(false)
const convertProgress = ref(0)
const convertStatus = ref('')
const showPreview = ref(false)
const previewHtml = ref('')
const taskId = ref('')
const chunkSize = 1024 * 1024 * 2 // 2MB

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

    // 上传文件
    const uploadResult = await uploadFile(formData)
    const fileId = uploadResult.id

    // 轮询获取转换结果
    let retryCount = 0
    const maxRetries = 30 // 最多尝试30次，每次间隔1秒
    
    const checkResult = async () => {
      try {
        const result = await getConversionResult(fileId)
        
        // 根据状态更新进度
        if (result.status === 0) { // 待转换
          convertProgress.value = 10
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(checkResult, 1000)
          } else {
            throw new Error('转换超时')
          }
        } else if (result.status === 1) { // 转换中
          convertProgress.value = 50
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(checkResult, 1000)
          } else {
            throw new Error('转换超时')
          }
        } else if (result.status === 2) { // 转换成功
          convertProgress.value = 100
          convertStatus.value = 'success'
          previewHtml.value = result.htmlContent
          showPreview.value = true
          converting.value = false
          ElMessage.success(t('upload.success'))
        } else if (result.status === 3) { // 转换失败
          throw new Error(result.errorMessage || '转换失败')
        }
      } catch (error) {
        console.error('获取转换结果失败:', error)
        convertStatus.value = 'exception'
        converting.value = false
        ElMessage.error(error.message || t('upload.error'))
      }
    }
    
    // 开始检查结果
    setTimeout(checkResult, 1000)
  } catch (error) {
    console.error('上传失败:', error)
    convertStatus.value = 'exception'
    converting.value = false
    ElMessage.error(t('upload.error'))
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
  taskId.value = ''
}

// 下载HTML
const downloadHtml = () => {
  const blob = new Blob([previewHtml.value], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'converted.html'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// 复制HTML
const copyHtml = async () => {
  try {
    await navigator.clipboard.writeText(previewHtml.value)
    ElMessage.success(t('preview.copySuccess'))
  } catch (error) {
    ElMessage.error(t('preview.copyError'))
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

// 滚动到指定区域
const scrollTo = (id) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #e0e0e0;
  scroll-behavior: smooth;
  scroll-padding-top: 80px; /* 为固定导航栏预留空间 */
}

.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: rgba(26, 26, 26, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  transition: all 0.3s ease;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-menu a:hover {
  color: #d4a055;
  background-color: rgba(212, 160, 85, 0.1);
}

.nav-menu .disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.language-dropdown {
  color: #e0e0e0;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 14px;
  background-color: rgba(255, 255, 255, 0.1);
  transition: background-color 0.3s;
}

.el-dropdown-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

:deep(.el-dropdown-menu) {
  background-color: #1a1a1a;
  border: none;
  border-radius: 4px;
  padding: 4px 0;
  min-width: 120px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
}

:deep(.el-dropdown-menu__item) {
  color: #e0e0e0;
  font-size: 14px;
  padding: 8px 16px;
  line-height: 1.4;
  transition: all 0.3s;
}

:deep(.el-dropdown-menu__item:hover),
:deep(.el-dropdown-menu__item:focus) {
  background-color: #2a2a2a;
  color: #fff;
}

:deep(.el-dropdown-menu__item.is-active) {
  background-color: #2a2a2a;
  color: #fff;
  font-weight: 500;
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