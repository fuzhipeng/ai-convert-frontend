import { createI18n } from 'vue-i18n'
import zhCN from './langs/zh-CN'
import enUS from './langs/en-US'
import jaJP from './langs/ja-JP'
import koKR from './langs/ko-KR'
import frFR from './langs/fr-FR'
import deDE from './langs/de-DE'
import esES from './langs/es-ES'
import ruRU from './langs/ru-RU'

// 获取浏览器语言设置
const getBrowserLanguage = () => {
  const language = navigator.language || navigator.userLanguage
  // 检查是否支持当前语言
  const supportedLanguage = SUPPORT_LANGUAGES.find(lang => language.startsWith(lang.value))
  return supportedLanguage ? supportedLanguage.value : 'zh-CN'
}

// 获取存储的语言设置或使用浏览器语言
const getStoredLanguage = () => {
  const storedLang = localStorage.getItem('language')
  if (storedLang && SUPPORT_LANGUAGES.some(lang => lang.value === storedLang)) {
    return storedLang
  }
  return getBrowserLanguage()
}

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

const i18n = createI18n({
  legacy: true, // 使用传统模式
  locale: getStoredLanguage(),
  fallbackLocale: 'en-US',
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'ja-JP': jaJP,
    'ko-KR': koKR,
    'fr-FR': frFR,
    'de-DE': deDE,
    'es-ES': esES,
    'ru-RU': ruRU
  },
  silentTranslationWarn: true,
  silentFallbackWarn: true,
  formatFallbackMessages: true,
  preserveDirectiveContent: true,
  missing: (locale, key) => {
    console.warn(`Missing translation: ${key} for locale: ${locale}`)
    return key
  },
  fallbackRoot: true,
  warnHtmlInMessage: 'off',
  escapeParameter: true
})

export default i18n 