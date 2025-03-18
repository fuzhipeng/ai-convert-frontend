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
              <el-button v-if="isDev" @click="testPreview" type="success">
                测试预览
              </el-button>
              <el-button v-if="isDev" @click="toggleDirectDisplay" type="warning">
                {{ directDisplay ? '使用iframe' : '直接显示' }}
              </el-button>
              <el-button v-if="isDev" @click="toggleRenderMethod" type="info">
                {{ renderMethod }}
              </el-button>
            </div>
          </div>
          <div class="preview-container">
            <div v-if="directDisplay" class="direct-preview" v-html="previewHtml"></div>
            <el-skeleton v-else :loading="previewLoading" animated :rows="20" style="width: 100%; min-height: 948px;">
              <template #default>
                <iframe ref="previewFrame" class="preview-frame"></iframe>
              </template>
            </el-skeleton>
          </div>
        </div>
      </div>

      <!-- 调试信息 -->
      <div v-if="isDev" class="debug-info">
        <h4>调试信息</h4>
        <p>HTML内容长度: {{ previewHtml.length }}</p>
        <p>HTML内容前100个字符: {{ previewHtml.substring(0, 100) }}...</p>
        <p>渲染模式: {{ directDisplay ? '直接显示' : 'iframe' }}</p>
        <p>iframe渲染方法: {{ renderMethod }}</p>
        <p>加载状态: {{ previewLoading ? '加载中' : '加载完成' }}</p>
        <p>文件已上传: {{ fileUploaded ? '是' : '否' }}</p>
        <p>文件ID: {{ fileId || '无' }}</p>
        <div class="api-url-form">
          <p>当前API基础URL: {{ apiBaseUrl.value || '未设置' }}</p>
          <el-input v-model="customApiUrl" placeholder="输入自定义API URL" style="margin-bottom: 10px;" />
          <el-button type="primary" size="small" @click="updateApiUrl">
            更新API URL
          </el-button>
        </div>
        <div class="debug-actions">
          <el-button type="danger" size="small" @click="dumpHtmlContent">
            打印完整HTML到控制台
          </el-button>
          <el-button type="warning" size="small" @click="forceRerender">
            强制重新渲染
          </el-button>
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
            <img :src="'/images/examples/example-' + i + '.jpg'" :alt="$t('features.examples.tag') + ' ' + i" class="example-image">
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
import axios from 'axios'

// API基础URL - 使用Vite环境变量
const apiBaseUrlDefault = import.meta.env.VITE_API_BASE_URL || ''
console.log('初始API基础URL:', apiBaseUrlDefault)
const apiBaseUrl = ref(apiBaseUrlDefault)
const customApiUrl = ref(apiBaseUrlDefault)

// 是否为开发环境
const isDev = import.meta.env.DEV

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
const previewLoading = ref(false)
const fileUploaded = ref(false)
const fileId = ref(null)
const isConverting = ref(false)
const errorMessage = ref('')

// 预览iframe引用
const previewFrame = ref(null)

// 改为默认使用iframe模式
const directDisplay = ref(false)

// 新增的渲染方法选项
const renderMethod = ref('srcdoc')

// 添加测试预览内容变量
const testHtmlContent = ref(`
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 1000px; margin: 0 auto; background-color: #f8f9fa; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding: 24px; background-color: white;">
      <div>
        <h1 style="font-size: 28px; color: #0052cc; margin: 0 0 8px 0; font-weight: 600;">首破万亿美元，深圳服务贸易大有潜力</h1>
        <p style="color: #666; margin: 0; font-size: 14px;">深圳发布 | 2025年03月12日</p>
      </div>
      <div style="background-color: #0052cc; width: 60px; height: 60px; border-radius: 50%; display: flex; justify-content: center; align-items: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      </div>
    </div>
    
    <div style="display: flex; gap: 20px; padding: 0 24px 24px;">
      <div style="flex: 1; background-color: #f0f5ff; padding: 20px; border-radius: 8px;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          <h2 style="margin: 0 0 0 8px; font-size: 18px; color: #333;">2024年服务贸易进出口总额</h2>
        </div>
        <p style="font-size: 32px; font-weight: 700; color: #ff6b00; margin: 0 0 8px 0;">1402.4亿美元</p>
        <p style="color: #666; margin: 0; font-size: 14px;">创历史新高</p>
      </div>
      
      <div style="flex: 1; background-color: #f0f5ff; padding: 20px; border-radius: 8px;">
        <div style="display: flex; align-items: center; margin-bottom: 12px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
          <h2 style="margin: 0 0 0 8px; font-size: 18px; color: #333;">2025年服务贸易目标</h2>
        </div>
        <p style="font-size: 32px; font-weight: 700; color: #ff6b00; margin: 0 0 8px 0;">1500亿美元以上</p>
        <p style="color: #666; margin: 0; font-size: 14px;">高质量发展行动计划</p>
      </div>
    </div>
    
    <div style="display: flex; gap: 20px; padding: 0 24px 24px;">
      <div style="flex: 1; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0052cc">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <h3 style="margin: 0 0 0 8px; font-size: 18px; color: #333;">现状与挑战</h3>
        </div>
        <ul style="padding-left: 20px; margin: 0; color: #333;">
          <li style="margin-bottom: 8px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 16px; margin-right: 8px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            深圳服务贸易排名全国第三，低于上海、北京
          </li>
          <li style="margin-bottom: 8px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 16px; margin-right: 8px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            服务贸易仅占全国外贸总额的14.6%
          </li>
          <li style="display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 16px; margin-right: 8px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            知识密集型服务贸易占比仅38.5%
          </li>
        </ul>
      </div>
      
      <div style="flex: 1; background-color: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; margin-bottom: 16px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
            <line x1="6" y1="1" x2="6" y2="4"></line>
            <line x1="10" y1="1" x2="10" y2="4"></line>
            <line x1="14" y1="1" x2="14" y2="4"></line>
          </svg>
          <h3 style="margin: 0 0 0 8px; font-size: 18px; color: #333;">深圳优势</h3>
        </div>
        <ul style="padding-left: 20px; margin: 0; color: #333;">
          <li style="margin-bottom: 8px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 16px; margin-right: 8px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            雄厚的数字经济、先进制造业基础
          </li>
          <li style="margin-bottom: 8px; display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 16px; margin-right: 8px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            华为、中兴、腾讯等企业国际竞争力强
          </li>
          <li style="display: flex; align-items: center;">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0052cc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="min-width: 16px; margin-right: 8px;">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            跨境电商等数字订购贸易成为新动能
          </li>
        </ul>
      </div>
    </div>
    
    <div style="padding: 16px 24px; background-color: #f8f9fa; border-top: 1px solid #eee; font-size: 12px; color: #666; display: flex; justify-content: space-between;">
      <div>来源：深圳发布</div>
      <div>文章概念卡片 © 2025</div>
    </div>
  </div>
`)

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 设置当前文件
    currentFile.value = {
      name: file.name,
      size: file.size,
      raw: file
    }
    fileUploaded.value = false
    showPreview.value = true
    // 然后调用startConvert
    startConvert()
  }
}

// 处理拖放
const handleDrop = (e) => {
  const file = e.dataTransfer.files[0]
  if (file) {
    // 设置当前文件
    currentFile.value = {
      name: file.name,
      size: file.size,
      raw: file
    }
    fileUploaded.value = false
    showPreview.value = true
    // 然后调用startConvert
    startConvert()
  }
}

// 下载HTML
const downloadHtml = () => {
  // 创建完整的HTML文档 - 确保与iframe中的HTML结构一致
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${currentFile.value.name.replace(/\.[^/.]+$/, '') + ' - 转换结果'}</title>
      <style>
        body {
          margin: 0;
          padding: 0; /* 移除内边距 */
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          color: #333;
          background-color: #fff;
          overflow-x: hidden;
        }
        img {
          max-width: 100%;
          height: auto;
        }
        svg {
          display: inline-block;
          vertical-align: middle;
        }
        * {
          box-sizing: border-box;
        }
        
        /* 添加服务贸易卡片的样式 */
        .service-trade-card {
          background-color: #f8f9fa;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          margin: 0 auto;
          max-width: 1000px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        
        .service-trade-card h1 {
          font-size: 28px; 
          color: #0052cc; 
          margin: 0 0 8px 0; 
          font-weight: 600;
        }
        
        .service-trade-card h2,
        .service-trade-card h3 {
          font-size: 18px; 
          color: #333; 
          margin: 0 0 8px 0;
        }
        
        /* 服务贸易卡片数据值样式 */
        .service-trade-card p[style*="font-size: 32px"],
        .service-trade-card span[style*="font-size: 32px"],
        .service-trade-card p:has(span[style*="font-size: 32px"]) {
          font-size: 32px !important;
          font-weight: 700 !important;
          color: #ff6b00 !important;
          margin: 0 0 8px 0 !important;
        }
        
        /* 服务贸易卡片列表样式 */
        .service-trade-card ul {
          padding-left: 20px;
          margin: 0;
          color: #333;
        }
        
        .service-trade-card li {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        /* 服务贸易卡片图标样式 */
        .service-trade-card svg {
          display: inline-block;
          vertical-align: middle;
          min-width: 16px;
          margin-right: 8px;
        }
        
        /* 服务贸易卡片卡片式布局 */
        .service-trade-card > div {
          padding: 10px 15px;
        }
        
        /* 服务贸易卡片数据区域样式 */
        .service-trade-card div[style*="background-color: #f0f5ff"] {
          background-color: #f0f5ff;
          padding: 10px;
          border-radius: 8px;
        }
        
        /* 服务贸易卡片底部样式 */
        .service-trade-card > div:last-child {
          padding: 8px 15px;
          background-color: #f8f9fa;
          border-top: 1px solid #eee;
          font-size: 12px;
          color: #666;
          display: flex;
          justify-content: space-between;
        }
        
        /* 通用表格样式 */
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        th {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
          background-color: #f2f2f2;
        }
        
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
        }
        
        tr {
          border-bottom: 1px solid #ddd;
        }
        
        /* 通用列表样式 */
        ul, ol {
          padding-left: 20px;
          margin: 15px 0;
        }
        
        li {
          margin-bottom: 8px;
          line-height: 1.5;
        }
        
        /* 通用标题样式 */
        h1, h2, h3, h4, h5, h6 {
          color: #333;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
        }
        
        /* 通用段落样式 */
        p {
          margin: 10px 0;
          line-height: 1.6;
          color: #333;
        }
      </style>
    </head>
    <body>
      ${previewHtml.value}
    </body>
    </html>
  `
  
  const blob = new Blob([fullHtml], { type: 'text/html' })
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
    ElMessage.success(t('preview.copySuccess'))
  } catch (error) {
    ElMessage.error(t('preview.copyError'))
  }
}

// 处理API响应数据时，增强原始内容的展示效果
const processHtmlContent = (htmlContent) => {
  if (!htmlContent) return htmlContent;
  
  // 记录原始HTML
  console.log('处理前的HTML内容:', htmlContent.substring(0, 500) + '...');
  
  // 检查HTML结构类型
  const hasStyle = htmlContent.includes('style="');
  const hasDiv = htmlContent.includes('<div');
  const hasTable = htmlContent.includes('<table');
  const hasList = htmlContent.includes('<ul') || htmlContent.includes('<ol');
  const hasHeading = /(<h[1-6][^>]*>)/i.test(htmlContent);
  const hasSVG = htmlContent.includes('<svg');
  const isJSON = htmlContent.trim().startsWith('{') && htmlContent.trim().endsWith('}');
  
  // 检查是否包含服务贸易关键词
  const isServiceTradeContent = htmlContent.includes('深圳服务贸易') || 
                                htmlContent.includes('首破万亿美元') || 
                                htmlContent.includes('服务贸易发展策略') ||
                                htmlContent.includes('1402.4亿美元') ||
                                htmlContent.includes('1500亿美元以上');
  
  console.log('内容类型检测结果:', {hasStyle, hasDiv, hasTable, hasList, hasHeading, hasSVG, isJSON, isServiceTradeContent});
  
  // 处理深圳服务贸易内容 - 保留原始内容结构
  if (isServiceTradeContent) {
    console.log('检测到深圳服务贸易相关内容，增强原始样式');
    
    // 保留原始内容，但添加增强样式
    let enhancedHtml = htmlContent;
    
    // 提取标题并增强
    if (enhancedHtml.includes('首破万亿美元') && !enhancedHtml.includes('font-size: 28px; color: #0052cc')) {
      enhancedHtml = enhancedHtml.replace(/([^>]*首破万亿美元[^<]*)/gi, 
        '<span style="font-size: 28px; color: #0052cc; font-weight: 600; display: block; margin-bottom: 8px;">$1</span>');
    }
    
    // 增强数据值
    if (enhancedHtml.includes('1402.4亿美元') && !enhancedHtml.includes('color: #ff6b00')) {
      enhancedHtml = enhancedHtml.replace(/1402\.4亿美元/g, 
        '<span style="font-size: 32px; font-weight: 700; color: #ff6b00; display: inline-block;">1402.4亿美元</span>');
    }
    
    if (enhancedHtml.includes('1500亿美元以上') && !enhancedHtml.includes('color: #ff6b00')) {
      enhancedHtml = enhancedHtml.replace(/1500亿美元以上/g, 
        '<span style="font-size: 32px; font-weight: 700; color: #ff6b00; display: inline-block;">1500亿美元以上</span>');
    }
    
    // 如果内容没有div包装，添加一个
    if (!hasDiv) {
      enhancedHtml = `<div>${enhancedHtml}</div>`;
    }
    
    // 确保有基本样式和包装
    if (!enhancedHtml.includes('font-family:') || !enhancedHtml.includes('margin: 0 auto')) {
      enhancedHtml = `<div class="service-trade-card" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; padding: 20px; max-width: 1000px; margin: 0 auto; background-color: #f8f9fa; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); color: #333;">
        ${enhancedHtml}
      </div>`;
    }
    
    return enhancedHtml;
  }
  
  // 处理可能的JSON字符串
  if (isJSON) {
    try {
      const jsonData = JSON.parse(htmlContent);
      console.log('检测到JSON数据:', jsonData);
      
      // 尝试从JSON中提取HTML内容
      let extractedHtml = '';
      if (jsonData.html) {
        extractedHtml = jsonData.html;
      } else if (jsonData.content) {
        extractedHtml = jsonData.content;
      } else if (jsonData.data && (jsonData.data.html || jsonData.data.content || jsonData.data.htmlContent)) {
        extractedHtml = jsonData.data.html || jsonData.data.content || jsonData.data.htmlContent;
      }
      
      if (extractedHtml) {
        console.log('从JSON中提取到HTML内容');
        return processHtmlContent(extractedHtml); // 递归处理提取出的HTML
      }
      
      // 如果没有提取到HTML，将JSON格式化为HTML
      return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; padding: 20px; background-color: #f8f9fa; border-radius: 8px; max-width: 1000px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">API 响应数据</h2>
        <pre style="background-color: #fff; padding: 15px; border-radius: 5px; overflow: auto; max-height: 500px;">${JSON.stringify(jsonData, null, 2)}</pre>
      </div>`;
    } catch (e) {
      console.error('JSON解析失败:', e);
      // 不是有效的JSON，继续按普通HTML处理
    }
  }
  
  // 处理简单文本内容（没有HTML标签）
  if (!hasDiv && !htmlContent.includes('<')) {
    console.log('检测到纯文本内容，添加基本样式');
    return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; padding: 10px; background-color: #fff; border-radius: 8px; max-width: 1000px; margin: 0 auto; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <p style="white-space: pre-wrap; line-height: 1.6; color: #333;">${htmlContent}</p>
    </div>`;
  }
  
  // 处理HTML内容但缺少样式的情况
  if ((hasDiv || hasTable || hasList || hasHeading) && !hasStyle) {
    console.log('检测到HTML内容但缺少样式，添加基本样式');
    
    let enhancedHtml = htmlContent;
    
    // 尝试修复可能的HTML结构问题
    if (enhancedHtml.includes('<div>') && !enhancedHtml.includes('</div>')) {
      enhancedHtml = enhancedHtml.replace(/<div>/g, '<div>') + '</div>';
    }
    
    // 包装并添加基本样式
    enhancedHtml = `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; padding: 10px; max-width: 1000px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); color: #333;">
      ${enhancedHtml}
    </div>`;
    
    // 增强表格样式
    if (hasTable && !enhancedHtml.includes('border-collapse')) {
      enhancedHtml = enhancedHtml.replace(/<table/g, '<table style="width: 100%; border-collapse: collapse; margin: 15px 0;"');
      enhancedHtml = enhancedHtml.replace(/<th/g, '<th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;"');
      enhancedHtml = enhancedHtml.replace(/<td/g, '<td style="border: 1px solid #ddd; padding: 8px; text-align: left;"');
      enhancedHtml = enhancedHtml.replace(/<tr/g, '<tr style="border-bottom: 1px solid #ddd;"');
    }
    
    // 增强列表样式
    if (hasList) {
      enhancedHtml = enhancedHtml.replace(/<ul/g, '<ul style="padding-left: 20px; margin: 15px 0;"');
      enhancedHtml = enhancedHtml.replace(/<ol/g, '<ol style="padding-left: 20px; margin: 15px 0;"');
      enhancedHtml = enhancedHtml.replace(/<li/g, '<li style="margin-bottom: 8px; line-height: 1.5;"');
    }
    
    // 增强标题样式
    if (hasHeading) {
      enhancedHtml = enhancedHtml.replace(/<h1([^>]*)>/g, '<h1$1 style="font-size: 28px; color: #333; margin: 20px 0 10px 0; font-weight: 600;">');
      enhancedHtml = enhancedHtml.replace(/<h2([^>]*)>/g, '<h2$1 style="font-size: 24px; color: #333; margin: 18px 0 9px 0; font-weight: 600;">');
      enhancedHtml = enhancedHtml.replace(/<h3([^>]*)>/g, '<h3$1 style="font-size: 20px; color: #333; margin: 16px 0 8px 0; font-weight: 600;">');
      enhancedHtml = enhancedHtml.replace(/<h4([^>]*)>/g, '<h4$1 style="font-size: 18px; color: #333; margin: 14px 0 7px 0; font-weight: 600;">');
      enhancedHtml = enhancedHtml.replace(/<h5([^>]*)>/g, '<h5$1 style="font-size: 16px; color: #333; margin: 12px 0 6px 0; font-weight: 600;">');
      enhancedHtml = enhancedHtml.replace(/<h6([^>]*)>/g, '<h6$1 style="font-size: 14px; color: #333; margin: 10px 0 5px 0; font-weight: 600;">');
    }
    
    // 增强段落样式
    enhancedHtml = enhancedHtml.replace(/<p(?![^>]*style)/g, '<p style="margin: 10px 0; line-height: 1.6; color: #333;"');
    
    return enhancedHtml;
  }
  
  // 其他已有样式的HTML内容增强
  if (hasStyle) {
    let enhancedHtml = htmlContent;
    
    // 为没有主要包装样式的内容添加外部容器
    if (!enhancedHtml.includes('margin: 0 auto') || !enhancedHtml.includes('max-width:')) {
      enhancedHtml = `<div style="max-width: 1000px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        ${enhancedHtml}
      </div>`;
    }
    
    return enhancedHtml;
  }
  
  // 其他任何类型的内容，至少添加基本样式容器
  if (htmlContent.trim().length > 0) {
    return `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto; padding: 10px; max-width: 1000px; margin: 0 auto; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); color: #333;">
      ${htmlContent}
    </div>`;
  }
  
  // 如果内容已经有足够的样式，则保持原样
  return htmlContent;
}

// 开始转换
const startConvert = async () => {
  if (!currentFile.value) {
    ElMessage.error('请先选择文件')
    return
  }

  try {
    isConverting.value = true
    converting.value = true
    previewHtml.value = ''
    errorMessage.value = ''
    previewLoading.value = true
    showPreview.value = true
    
    console.log('开始文件转换流程，当前文件:', currentFile.value.name)
    
    // 模拟转换进度
    let progress = 0
    const progressInterval = setInterval(() => {
      progress += 10
      convertProgress.value = Math.min(progress, 90) // 最多到90%，等待实际结果
      
      if (progress >= 100) {
        clearInterval(progressInterval)
      }
    }, 500)
    
    // 上传文件
    try {
      console.log('准备上传文件...')
      // 创建FormData对象
      const formData = new FormData()
      formData.append('file', currentFile.value.raw)

      // 发送POST请求上传文件
      console.log('正在调用上传API:', `${apiBaseUrl.value}/api/file/upload`)
      const response = await axios.post(`${apiBaseUrl.value}/api/file/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      // 如果上传成功，设置fileId
      console.log('文件上传成功，响应数据:', response.data)
      fileUploaded.value = true
      fileId.value = response.data.id || response.data.data?.id
      console.log('提取的文件ID:', fileId.value)
      
      if (!fileId.value) {
        throw new Error('上传成功但未能获取文件ID')
      }
    } catch (uploadError) {
      console.error('文件上传失败:', uploadError)
      clearInterval(progressInterval)
      convertStatus.value = 'exception'
      errorMessage.value = `上传失败: ${uploadError.message || '服务器错误'}`
      previewLoading.value = false
      isConverting.value = false
      return
    }
    
    // 获取转换结果
    try {
      console.log('准备获取转换结果，文件ID:', fileId.value)
      console.log('调用转换API:', `${apiBaseUrl.value}/api/file/conversion/${fileId.value}`)
      
      const conversionResponse = await axios.get(`${apiBaseUrl.value}/api/file/conversion/${fileId.value}`)
      console.log('获取转换结果成功:', conversionResponse.status)
      
      clearInterval(progressInterval)
      convertProgress.value = 100
      convertStatus.value = 'success'
      
      const responseData = conversionResponse.data
      console.log('转换结果数据:', JSON.stringify(responseData).substring(0, 200) + '...')

      // 检查返回数据，提取HTML内容
      let htmlContent = ''
      
      try {
        const data = responseData.data || responseData
        console.log('提取的数据类型:', typeof data)
        
        if (typeof data === 'string') {
          console.log('数据是字符串类型')
          if (data.trim().startsWith('{') && data.trim().endsWith('}')) {
            // 是JSON字符串
            try {
              console.log('尝试解析JSON字符串')
              const jsonData = JSON.parse(data)
              console.log('JSON解析成功，查找HTML内容字段')
              
              if (jsonData.htmlContent) {
                console.log('从jsonData.htmlContent获取内容')
                htmlContent = jsonData.htmlContent
              } else if (jsonData.html) {
                console.log('从jsonData.html获取内容')
                htmlContent = jsonData.html
              } else if (jsonData.content) {
                console.log('从jsonData.content获取内容')
                htmlContent = jsonData.content
              } else {
                // 遍历JSON对象查找可能包含HTML的字段
                console.log('遍历JSON字段查找HTML内容')
                for (const key in jsonData) {
                  if (typeof jsonData[key] === 'string' && 
                      (jsonData[key].includes('<div') || 
                       jsonData[key].includes('<p') || 
                       jsonData[key].includes('<html'))) {
                    console.log(`从字段${key}找到HTML内容`)
                    htmlContent = jsonData[key]
                    break
                  }
                }
                // 如果仍然没有找到HTML内容，则直接显示JSON字符串
                if (!htmlContent) {
                  console.log('未找到HTML内容，显示格式化的JSON')
                  htmlContent = `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`
                }
              }
            } catch (e) {
              console.error('解析JSON时出错:', e)
              htmlContent = data // 如果解析失败，直接显示原始字符串
            }
          } else {
            console.log('数据是普通字符串，可能直接是HTML')
            htmlContent = data
          }
        } else if (typeof data === 'object') {
          console.log('数据是对象类型，查找HTML内容字段')
          if (data.htmlContent) {
            console.log('从data.htmlContent获取内容')
            htmlContent = data.htmlContent
          } else if (data.html) {
            console.log('从data.html获取内容')
            htmlContent = data.html
          } else if (data.content) {
            console.log('从data.content获取内容')
            htmlContent = data.content
          } else {
            // 尝试JSON.stringify
            console.log('未找到HTML内容字段，显示格式化的JSON对象')
            htmlContent = `<pre>${JSON.stringify(data, null, 2)}</pre>`
          }
        } else {
          console.log('未知的数据格式:', typeof data)
          htmlContent = '无法识别的数据格式'
        }
      } catch (e) {
        console.error('处理响应数据时出错:', e)
        htmlContent = '处理数据时出错: ' + e.message
      }
      
      console.log('提取的HTML内容长度:', htmlContent ? htmlContent.length : 0)
      
      // 处理HTML内容
      if (htmlContent && htmlContent.trim()) {
        // 处理HTML内容
        console.log('处理HTML内容...')
        previewHtml.value = processHtmlContent(htmlContent)
        console.log('HTML内容已处理完成，长度:', previewHtml.value.length)
        
        // 根据显示模式决定渲染方式
        if (!directDisplay.value) {
          console.log('使用iframe模式渲染HTML')
          // 使用renderHTMLInIframe函数渲染HTML内容
          setTimeout(() => {
            renderHTMLInIframe()
          }, 0)
        } else {
          console.log('使用直接显示模式')
          previewLoading.value = false
        }
      } else {
        console.warn('未获取到有效的HTML内容')
        previewHtml.value = '<div class="error-message">未获取到有效的HTML内容</div>'
        previewLoading.value = false
      }
    } catch (conversionError) {
      console.error('获取转换结果时出错:', conversionError)
      clearInterval(progressInterval)
      convertStatus.value = 'exception'
      errorMessage.value = `获取转换结果失败: ${conversionError.message || '服务器错误'}`
      previewLoading.value = false
    }
  } catch (error) {
    console.error('转换过程中出错:', error)
    convertStatus.value = 'exception'
    errorMessage.value = `转换失败: ${error.message || '未知错误'}`
    previewLoading.value = false
  } finally {
    isConverting.value = false
  }
}

// 重试转换
const retryConvert = () => {
  if (currentFile.value) {
    fileUploaded.value = false
    startConvert()
  }
}

// 取消转换
const cancelConvert = () => {
  isConverting.value = false
  currentFile.value = null
  convertProgress.value = 0
  convertStatus.value = ''
  showPreview.value = false
  fileUploaded.value = false
  fileId.value = null
  previewHtml.value = ''
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

// 测试预览功能
const testPreview = () => {
  console.log('开始测试预览')
  previewHtml.value = testHtmlContent.value
  previewLoading.value = true

  // 始终使用iframe模式
  if (!directDisplay.value) {
    console.log('使用iframe模式预览测试内容')
    // 使用renderHTMLInIframe函数渲染HTML内容
    setTimeout(() => {
      renderHTMLInIframe()
    }, 0)
  } else {
    console.log('使用直接显示模式预览测试内容')
    previewLoading.value = false
  }
}

// 实际图片路径数组
const exampleImages = Array.from({ length: 9 }, (_, i) => `/images/examples/example-${i + 1}.jpg`)

// 切换直接显示HTML内容的选项
const toggleDirectDisplay = () => {
  directDisplay.value = !directDisplay.value
  
  // 如果切换到iframe模式且有HTML内容，立即渲染
  if (!directDisplay.value && previewHtml.value && showPreview.value) {
    previewLoading.value = true
    setTimeout(() => {
      try {
        renderHTMLInIframe();
      } catch (error) {
        console.error('切换到iframe模式时出错:', error)
        previewLoading.value = false
      }
    }, 100)
  }
}

// 切换渲染方法
const toggleRenderMethod = () => {
  const methods = ['srcdoc', 'blob', 'write']
  const currentIndex = methods.indexOf(renderMethod.value)
  const nextIndex = (currentIndex + 1) % methods.length
  renderMethod.value = methods[nextIndex]
}

// 打印完整HTML到控制台
const dumpHtmlContent = () => {
  console.group('HTML内容调试')
  console.log('HTML内容长度:', previewHtml.value.length)
  console.log('HTML内容完整字符串:', previewHtml.value)
  console.groupEnd()
}

// 强制重新渲染
const forceRerender = () => {
  if (!previewHtml.value) {
    ElMessage.warning('没有HTML内容可渲染')
    return
  }
  
  previewLoading.value = true
  
  // 使用iframe渲染当前的HTML内容
  setTimeout(() => {
    try {
      // 创建新的iframe元素
      const newFrame = document.createElement('iframe')
      newFrame.className = 'preview-frame'
      newFrame.style.width = '100%'
      newFrame.style.minWidth = '1280px'
      newFrame.style.minHeight = '948px'
      newFrame.style.border = 'none'
      newFrame.style.display = 'block'
      newFrame.style.backgroundColor = '#fff'
      
      // 构建完整的HTML内容
      const frameContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <base href="${window.location.origin}">
          <style>
            body {
              margin: 0;
              padding: 0; /* 移除内边距 */
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
              color: #333;
              background-color: #fff;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            svg {
              display: inline-block;
              vertical-align: middle;
            }
            * {
              box-sizing: border-box;
            }
          </style>
        </head>
        <body>
          ${previewHtml.value}
        </body>
        </html>
      `
      
      console.log('强制重渲染 - HTML frame内容长度:', frameContent.length)
      
      // 使用srcdoc属性设置HTML内容
      newFrame.srcdoc = frameContent
      
      // 等待iframe加载完成
      newFrame.onload = () => {
        console.log('强制重渲染 - iframe加载完成')
        previewLoading.value = false
        
        // 调整iframe高度以适应内容
        try {
          const body = newFrame.contentDocument.body
          if (body) {
            const height = Math.max(body.scrollHeight, 948)
            newFrame.style.height = `${height}px`
            console.log('强制重渲染 - iframe高度已调整为:', height)
          }
        } catch (e) {
          console.error('强制重渲染 - 调整iframe高度时出错:', e)
        }
      }
      
      // 替换现有iframe
      if (previewFrame.value && previewFrame.value.parentNode) {
        previewFrame.value.parentNode.replaceChild(newFrame, previewFrame.value)
        previewFrame.value = newFrame
        console.log('强制重渲染 - 替换了iframe')
      } else {
        console.error('强制重渲染 - 无法找到现有iframe或其父节点')
        previewLoading.value = false
      }
    } catch (error) {
      console.error('强制重渲染时出错:', error)
      previewLoading.value = false
      ElMessage.error('强制重渲染时出错')
    }
  }, 100)
}

// 提取iframe渲染逻辑为单独的函数，确保和下载HTML时的结构一致
const renderHTMLInIframe = () => {
  console.log('开始渲染HTML内容到iframe');
  
  // 创建新的iframe元素
  const newFrame = document.createElement('iframe');
  newFrame.className = 'preview-frame';
  newFrame.style.width = '100%';
  newFrame.style.minWidth = '100%';
  newFrame.style.minHeight = '800px'; 
  newFrame.style.border = 'none';
  newFrame.style.display = 'block';
  newFrame.style.backgroundColor = '#fff';
  newFrame.setAttribute('sandbox', 'allow-same-origin allow-scripts');
  
  // 构建HTML内容
  const htmlParts = [];
  htmlParts.push('<!DOCTYPE html>');
  htmlParts.push('<html>');
  htmlParts.push('<head>');
  htmlParts.push('<meta charset="UTF-8">');
  htmlParts.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  
  // 添加标题
  const title = (currentFile.value?.name?.replace(/\.[^/.]+$/, '') || '文档') + ' - 预览';
  htmlParts.push(`<title>${title}</title>`);
  
  // 添加base标签
  htmlParts.push(`<base href="${window.location.origin}">`);
  
  // 添加样式
  htmlParts.push('<style>');
  htmlParts.push('body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif; color: #333; background-color: #fff; overflow-x: hidden; }');
  htmlParts.push('img { max-width: 100%; height: auto; }');
  htmlParts.push('svg { display: inline-block; vertical-align: middle; }');
  htmlParts.push('* { box-sizing: border-box; }');
  htmlParts.push('.service-trade-card { background-color: #f8f9fa; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 0 auto; max-width: 1000px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }');
  htmlParts.push('.service-trade-card h1 { font-size: 28px; color: #0052cc; margin: 0 0 8px 0; font-weight: 600; }');
  htmlParts.push('.service-trade-card h2, .service-trade-card h3 { font-size: 18px; color: #333; margin: 0 0 8px 0; }');
  htmlParts.push('.service-trade-card p[style*="font-size: 32px"], .service-trade-card span[style*="font-size: 32px"], .service-trade-card p:has(span[style*="font-size: 32px"]) { font-size: 32px !important; font-weight: 700 !important; color: #ff6b00 !important; margin: 0 0 8px 0 !important; }');
  htmlParts.push('.service-trade-card ul { padding-left: 20px; margin: 0; color: #333; }');
  htmlParts.push('.service-trade-card li { margin-bottom: 8px; display: flex; align-items: center; }');
  htmlParts.push('.service-trade-card svg { display: inline-block; vertical-align: middle; min-width: 16px; margin-right: 8px; }');
  htmlParts.push('.service-trade-card > div { padding: 10px 15px; }');
  htmlParts.push('.service-trade-card div[style*="background-color: #f0f5ff"] { background-color: #f0f5ff; padding: 10px; border-radius: 8px; }');
  htmlParts.push('.service-trade-card > div:last-child { padding: 8px 15px; background-color: #f8f9fa; border-top: 1px solid #eee; font-size: 12px; color: #666; display: flex; justify-content: space-between; }');
  htmlParts.push('table { width: 100%; border-collapse: collapse; margin: 15px 0; }');
  htmlParts.push('th { border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2; }');
  htmlParts.push('td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
  htmlParts.push('tr { border-bottom: 1px solid #ddd; }');
  htmlParts.push('ul, ol { padding-left: 20px; margin: 15px 0; }');
  htmlParts.push('li { margin-bottom: 8px; line-height: 1.5; }');
  htmlParts.push('h1, h2, h3, h4, h5, h6 { color: #333; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; }');
  htmlParts.push('p { margin: 10px 0; line-height: 1.6; color: #333; }');
  htmlParts.push('html, body { height: auto !important; overflow: visible !important; }');
  htmlParts.push('</style>');
  
  // 添加脚本
  htmlParts.push('<script>');
  htmlParts.push('function updateHeight() {');
  htmlParts.push('  const height = Math.max(');
  htmlParts.push('    document.documentElement.scrollHeight,');
  htmlParts.push('    document.documentElement.offsetHeight,');
  htmlParts.push('    document.documentElement.clientHeight,');
  htmlParts.push('    document.body.scrollHeight,');
  htmlParts.push('    document.body.offsetHeight,');
  htmlParts.push('    document.body.clientHeight,');
  htmlParts.push('    800');
  htmlParts.push('  );');
  htmlParts.push('  window.parent.postMessage({ type: "resize", height: height }, "*");');
  htmlParts.push('}');
  htmlParts.push('window.addEventListener("load", function() {');
  htmlParts.push('  updateHeight();');
  htmlParts.push('  setTimeout(updateHeight, 500);');
  htmlParts.push('  setTimeout(updateHeight, 1000);');
  htmlParts.push('  setTimeout(updateHeight, 2000);');
  htmlParts.push('});');
  htmlParts.push('window.addEventListener("resize", updateHeight);');
  htmlParts.push('const observer = new MutationObserver(function() {');
  htmlParts.push('  updateHeight();');
  htmlParts.push('});');
  htmlParts.push('document.addEventListener("DOMContentLoaded", function() {');
  htmlParts.push('  observer.observe(document.body, {');
  htmlParts.push('    childList: true,');
  htmlParts.push('    subtree: true');
  htmlParts.push('  });');
  htmlParts.push('  updateHeight();');
  htmlParts.push('});');
  htmlParts.push('</' + 'script>'); // 避免Vue解析错误
  
  // 添加body标签和内容
  htmlParts.push('</' + 'head>'); // 避免Vue解析错误
  htmlParts.push('<body>');
  htmlParts.push(previewHtml.value);
  htmlParts.push('</body>');
  htmlParts.push('</html>');
  
  // 合并所有HTML部分
  const frameContent = htmlParts.join('\n');
  
  // 使用srcdoc属性设置HTML内容
  newFrame.srcdoc = frameContent;
  
  // 监听从iframe发送的消息，用于动态调整高度
  const handleMessage = (event) => {
    if (event.data && event.data.type === 'resize') {
      console.log('收到iframe高度调整消息:', event.data.height);
      newFrame.style.height = `${event.data.height}px`;
    }
  };
  
  window.addEventListener('message', handleMessage);
  
  // 等待iframe加载完成
  newFrame.onload = () => {
    console.log('iframe加载完成');
    previewLoading.value = false;
    
    // 调整iframe高度以适应内容
    try {
      const body = newFrame.contentDocument?.body;
      if (body) {
        // 使用更精确的方式计算内容高度
        const height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          body.clientHeight,
          document.documentElement.clientHeight * 0.8,
          800
        );
        newFrame.style.height = `${height + 50}px`;
        console.log('iframe高度已调整为:', height + 50);
      }
    } catch (e) {
      console.error('调整iframe高度时出错:', e);
    }
  };
  
  // 替换现有iframe
  setTimeout(() => {
    if (previewFrame.value && previewFrame.value.parentNode) {
      previewFrame.value.parentNode.replaceChild(newFrame, previewFrame.value);
      previewFrame.value = newFrame;
    } else if (previewFrame.value === null) {
      // 如果previewFrame.value为null，则尝试找到容器并添加iframe
      const container = document.querySelector('.preview-container');
      if (container) {
        container.innerHTML = '';
        container.appendChild(newFrame);
        previewFrame.value = newFrame;
      }
    }
  }, 0);
  
  // 如果onload事件没有触发，手动设置加载完成
  setTimeout(() => {
    if (previewLoading.value) {
      console.log('iframe加载超时，手动设置加载完成');
      previewLoading.value = false;
    }
  }, 3000);
  
  // 添加多次检查高度的定时任务，确保内容完全显示
  const checkHeightIntervals = [500, 1000, 2000, 3000, 5000];
  checkHeightIntervals.forEach(delay => {
    setTimeout(() => {
      try {
        if (newFrame.contentDocument && newFrame.contentDocument.body) {
          const height = Math.max(
            newFrame.contentDocument.body.scrollHeight,
            newFrame.contentDocument.body.offsetHeight,
            newFrame.contentDocument.body.clientHeight,
            newFrame.contentDocument.documentElement.scrollHeight,
            newFrame.contentDocument.documentElement.offsetHeight,
            newFrame.contentDocument.documentElement.clientHeight,
            800
          );
          newFrame.style.height = `${height + 50}px`;
          console.log(`${delay}ms后重新检查高度: ${height + 50}px`);
        }
      } catch (e) {
        console.error(`${delay}ms后检查高度出错:`, e);
      }
    }, delay);
  });
  
  // 监听iframe内容变化
  setTimeout(() => {
    try {
      if (newFrame.contentDocument) {
        const contentObserver = new MutationObserver(() => {
          try {
            const height = Math.max(
              newFrame.contentDocument.body.scrollHeight,
              newFrame.contentDocument.body.offsetHeight,
              newFrame.contentDocument.body.clientHeight,
              800
            );
            newFrame.style.height = `${height + 50}px`;
            console.log('DOM变化后调整高度:', height + 50);
          } catch (e) {
            console.error('DOM变化后调整高度出错:', e);
          }
        });
        
        contentObserver.observe(newFrame.contentDocument.body, {
          childList: true,
          subtree: true,
          attributes: true
        });
      }
    } catch (e) {
      console.error('设置DOM观察器出错:', e);
    }
  }, 1000);
  
  return newFrame;
}

// 更新API URL
const updateApiUrl = () => {
  apiBaseUrl.value = customApiUrl.value
  console.log('API URL已更新为:', apiBaseUrl.value)
  ElMessage.success('API URL已更新')
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
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 4rem;
}

.upload-area {
  width: 100%;
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
  width: 100%;
  background-color: #2d2d2d;
  border-radius: 8px;
  padding: 0; /* 移除内边距 */
  margin-top: 2rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 0 1rem; /* 只给header添加内边距 */
}

.preview-container {
  width: 100%;
  overflow: visible;
  background-color: transparent; /* 改为透明背景 */
  border-radius: 4px;
  box-shadow: none; /* 移除阴影 */
  max-width: 1280px;
  margin: 0 auto;
  max-height: none;
  padding: 0; /* 确保没有内边距 */
}

.preview-frame {
  width: 100%;
  min-width: 100%;
  min-height: 800px;
  border: none;
  display: block;
  background-color: #fff;
  padding: 0; /* 确保没有内边距 */
  margin: 0; /* 确保没有外边距 */
}

/* 确保预览区域在移动设备上也能正常显示 */
@media (max-width: 1280px) {
  .preview-container {
    overflow-x: auto;
  }
}

.preview-content {
  display: none; /* 隐藏原来的预览内容区域 */
}

.direct-preview {
  width: 100%;
  min-height: 300px;
  background-color: #fff;
  color: #333;
  padding: 0; /* 移除内边距 */
  border-radius: 4px;
  overflow: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 恢复基本样式 */
.direct-preview :deep(div) {
  max-width: 100%;
}

.direct-preview :deep(img) {
  max-width: 100%;
  height: auto;
}

.direct-preview :deep(*) {
  box-sizing: border-box;
}

/* 为深圳服务贸易的特殊样式 */
.direct-preview :deep(.service-trade-card) {
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  margin: 0 auto;
  max-width: 1000px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 服务贸易卡片标题样式 */
.direct-preview :deep(.service-trade-card h1) {
  font-size: 28px; 
  color: #0052cc; 
  margin: 0 0 8px 0; 
  font-weight: 600;
}

/* 服务贸易卡片子标题样式 */
.direct-preview :deep(.service-trade-card h2),
.direct-preview :deep(.service-trade-card h3) {
  font-size: 18px; 
  color: #333; 
  margin: 0 0 8px 0;
}

/* 服务贸易卡片数据值样式 */
.direct-preview :deep(.service-trade-card p[style*="font-size: 32px"]),
.direct-preview :deep(.service-trade-card p:has(span[style*="font-size: 32px"])) {
  font-size: 32px !important;
  font-weight: 700 !important;
  color: #ff6b00 !important;
  margin: 0 0 8px 0 !important;
}

/* 服务贸易卡片列表样式 */
.direct-preview :deep(.service-trade-card ul) {
  padding-left: 20px;
  margin: 0;
  color: #333;
}

.direct-preview :deep(.service-trade-card li) {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

/* 服务贸易卡片图标样式 */
.direct-preview :deep(.service-trade-card svg) {
  display: inline-block;
  vertical-align: middle;
  min-width: 16px;
  margin-right: 8px;
}

/* 服务贸易卡片卡片式布局 */
.direct-preview :deep(.service-trade-card > div) {
  padding: 10px 15px;
}

.direct-preview :deep(.service-trade-card > div:first-child) {
  background-color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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

.debug-actions {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.api-url-form {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.api-url-form p {
  margin-bottom: 0.5rem;
}

.api-url-form .el-input {
  width: 300px;
}

.api-url-form .el-button {
  margin-top: 0.5rem;
}
</style> 