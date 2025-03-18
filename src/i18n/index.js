import { createI18n } from 'vue-i18n'
import zhCN from './langs/zh-CN'
import enUS from './langs/en-US'
import frFR from './langs/fr-FR'
import deDE from './langs/de-DE'
import esES from './langs/es-ES'
import jaJP from './langs/ja-JP'
import koKR from './langs/ko-KR'
import ruRU from './langs/ru-RU'

// 导出支持的语言列表
export const SUPPORT_LANGUAGES = [
  {
    label: '简体中文',
    value: 'zh-CN',
    icon: '🇨🇳'
  },
  {
    label: 'English',
    value: 'en-US',
    icon: '🇺🇸'
  },
  {
    label: '日本語',
    value: 'ja-JP',
    icon: '🇯🇵'
  },
  {
    label: '한국어',
    value: 'ko-KR',
    icon: '🇰🇷'
  },
  {
    label: 'Français',
    value: 'fr-FR',
    icon: '🇫🇷'
  },
  {
    label: 'Deutsch',
    value: 'de-DE',
    icon: '🇩🇪'
  },
  {
    label: 'Español',
    value: 'es-ES',
    icon: '🇪🇸'
  },
  {
    label: 'Русский',
    value: 'ru-RU',
    icon: '🇷🇺'
  }
]

// 获取浏览器语言设置
const getBrowserLanguage = () => {
  try {
    const language = navigator.language || navigator.userLanguage
    // 检查是否支持当前语言
    const supportedLanguage = SUPPORT_LANGUAGES.find(lang => language.startsWith(lang.value))
    return supportedLanguage ? supportedLanguage.value : 'zh-CN'
  } catch (e) {
    console.error('获取浏览器语言失败:', e)
    return 'zh-CN'
  }
}

// 获取存储的语言设置或使用浏览器语言
const getStoredLanguage = () => {
  try {
    const storedLang = localStorage.getItem('lang')
    if (storedLang && SUPPORT_LANGUAGES.some(lang => lang.value === storedLang)) {
      return storedLang
    }
    return getBrowserLanguage()
  } catch (e) {
    console.error('获取存储语言失败:', e)
    return 'zh-CN'
  }
}

// 创建i18n实例
const i18n = createI18n({
  // 添加遗留模式以提高兼容性
  legacy: true,
  // 设置全局注入，使所有组件自动包含$t方法
  globalInjection: true,
  // 设置默认语言为中文或存储的语言
  locale: getStoredLanguage(),
  // 设置备用语言，当当前语言包中没有某个key时，会使用备用语言包中的值
  fallbackLocale: 'zh-CN',
  // 启用跨组件消息
  allowComposition: true,
  // 添加语言包
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'fr-FR': frFR,
    'de-DE': deDE,
    'es-ES': esES,
    'ja-JP': jaJP,
    'ko-KR': koKR,
    'ru-RU': ruRU,
  },
  // 添加错误处理
  missingWarn: false,
  fallbackWarn: false,
  silentFallbackWarn: true,
  formatFallbackMessages: true,
})

// 添加安全检查以防止意外错误
try {
  // 检查本地存储中的语言设置是否有效
  const storedLang = localStorage.getItem('lang')
  if (storedLang && !Object.keys(i18n.global.messages).includes(storedLang)) {
    console.warn(`检测到无效的语言设置: ${storedLang}，重置为默认语言`)
    localStorage.setItem('lang', 'zh-CN')
    i18n.global.locale = 'zh-CN'
  }
} catch (e) {
  console.error('初始化语言设置时出错:', e)
  // 出错时回退到中文
  try {
    localStorage.setItem('lang', 'zh-CN')
  } catch (storageError) {
    console.error('无法访问localStorage:', storageError)
  }
}

export default i18n 