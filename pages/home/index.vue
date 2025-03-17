<template>
  <div class="home">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <router-link to="/" class="logo">
          <img src="@/assets/logo.png" alt="">
          <span class="logo-text">{{ $t('nav.home') }}</span>
        </router-link>
        <nav class="nav-menu">
          <a href="#features" @click.prevent="scrollToSection('features')">{{ $t('nav.features') }}</a>
          <a href="#faq" @click.prevent="scrollToSection('faq')">{{ $t('nav.faq') }}</a>
          <router-link to="/pricing">{{ $t('nav.pricing') }}</router-link>
        </nav>
      </div>
      <div class="header-right">
        <el-dropdown class="language-dropdown" @command="handleLanguageChange">
          <span class="el-dropdown-link">
            {{ currentLanguageLabel }} <el-icon><arrow-down /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="lang in supportedLanguages" :key="lang.value" :command="lang.value">
                {{ lang.icon }} {{ lang.label }}
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
            <el-icon class="feature-icon"><reading /></el-icon>
            <h3>{{ $t('features.cards.free.title') }}</h3>
            <p>{{ $t('features.cards.free.desc') }}</p>
          </div>
          
          <div class="feature-card">
            <el-icon class="feature-icon"><star /></el-icon>
            <h3>{{ $t('features.cards.quality.title') }}</h3>
            <p>{{ $t('features.cards.quality.desc') }}</p>
          </div>
          
          <div class="feature-card">
            <el-icon class="feature-icon"><magic-stick /></el-icon>
            <h3>{{ $t('features.cards.smart.title') }}</h3>
            <p>{{ $t('features.cards.smart.desc') }}</p>
          </div>

          <div class="feature-card">
            <el-icon class="feature-icon"><lock /></el-icon>
            <h3>{{ $t('features.cards.privacy.title') }}</h3>
            <p>{{ $t('features.cards.privacy.desc') }}</p>
          </div>
          
          <div class="feature-card">
            <el-icon class="feature-icon"><document /></el-icon>
            <h3>{{ $t('features.cards.understanding.title') }}</h3>
            <p>{{ $t('features.cards.understanding.desc') }}</p>
          </div>
          
          <div class="feature-card">
            <el-icon class="feature-icon"><medal /></el-icon>
            <h3>{{ $t('features.cards.advanced.title') }}</h3>
            <p>{{ $t('features.cards.advanced.desc') }}</p>
          </div>
        </div>
      </div>

      <!-- 用户提取示例部分 -->
      <div class="examples-section">
        <h2>{{ $t('features.examples.title') }}</h2>
        <p class="examples-subtitle">{{ $t('features.examples.subtitle') }}</p>
        
        <div class="examples-grid">
          <div v-for="i in 9" :key="i" class="example-item">
            <img :src="`/images/examples/example-${i}.jpg`" :alt="`${$t('features.examples.tag')} ${i}`" class="example-image">
            <div class="example-overlay">
              <span class="example-tag">{{ $t('features.examples.tag') }} {{i}}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 用户评价部分 -->
      <Testimonials />

      <!-- FAQ部分 -->
      <div id="faq">
        <FAQ />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled, Document, Money, Star, Reading, Lock, MagicStick, Medal, ArrowDown } from '@element-plus/icons-vue'
import Testimonials from '@/components/Testimonials.vue'
import FAQ from '@/components/FAQ.vue'
import { useI18n } from 'vue-i18n'
import { SUPPORT_LANGUAGES } from '@/i18n'

// 国际化
const { t, locale } = useI18n()

// 支持的语言
const supportedLanguages = SUPPORT_LANGUAGES

// 当前语言标签
const currentLanguageLabel = computed(() => {
  const currentLang = supportedLanguages.find(lang => lang.value === locale.value)
  return currentLang ? currentLang.label : '简体中文'
})

// 处理语言切换
const handleLanguageChange = (langValue) => {
  locale.value = langValue
  localStorage.setItem('language', langValue)
  ElMessage.success(t('system.languageChanged', { lang: currentLanguageLabel.value }))
}

// 滚动到指定部分
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

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

// 实际图片路径数组
const exampleImages = Array.from({ length: 9 }, (_, i) => `/images/examples/example-${i + 1}.jpg`)
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
  gap: 0.8rem;
  text-decoration: none;
  color: #e0e0e0;
}

.logo img {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.logo-text {
  font-size: 1.2rem;
  font-weight: 600;
  white-space: nowrap;
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
  padding: 0 1rem;
}

.features-subtitle {
  color: #888;
  margin-bottom: 3rem;
  font-size: 1.1rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(2, auto);
  gap: 1.5rem;
  margin-top: 2rem;
  margin-bottom: 3rem;
  width: 100%;
  overflow: visible;
  max-height: none !important;
}

.feature-card {
  background-color: #2d2d2d;
  padding: 1.8rem;
  border-radius: 10px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 1 !important;
  visibility: visible !important;
  position: relative !important;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  font-size: 48px;
  color: #d4a055;
  margin-bottom: 1.5rem;
}

.feature-card h3 {
  margin-bottom: 1rem;
  color: #e0e0e0;
  font-size: 1.2rem;
  font-weight: 600;
}

.feature-card p {
  color: #888;
  font-size: 0.9rem;
  line-height: 1.6;
}

.examples-section {
  text-align: center;
  margin-top: 4rem;
  padding: 0 1rem;
  margin-bottom: 4rem;
}

.examples-section h2 {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #e0e0e0;
}

.examples-subtitle {
  color: #888;
  margin-bottom: 3rem;
  font-size: 1.1rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

.examples-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 1.5rem;
  margin: 2rem auto;
  width: 100%;
  max-width: 1200px;
}

.example-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  aspect-ratio: 4/3;
}

.example-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
}

.example-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.example-item:hover .example-image {
  transform: scale(1.05);
}

.example-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.example-item:hover .example-overlay {
  opacity: 1;
}

.example-tag {
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  background-color: rgba(212, 160, 85, 0.8);
  border-radius: 20px;
}

.debug-info {
  margin-top: 2rem;
  text-align: center;
  background-color: rgba(212, 160, 85, 0.1);
  border: 1px solid #d4a055;
  border-radius: 8px;
  padding: 1rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.debug-info p {
  margin: 0.5rem 0;
  color: #d4a055;
}
</style> 