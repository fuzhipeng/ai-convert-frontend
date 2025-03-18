import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import i18n from './i18n'

// 全局错误处理
window.addEventListener('error', function(event) {
  console.error('全局错误捕获:', event.error);
  // 可以在这里添加错误上报或自定义错误展示逻辑
});

// 未捕获的Promise错误
window.addEventListener('unhandledrejection', function(event) {
  console.error('未处理的Promise错误:', event.reason);
});

const app = createApp(App)

// 配置Vue错误处理器
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue错误:', err);
  console.error('错误信息:', info);
};

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.use(ElementPlus)
app.use(i18n)
app.use(router)
app.mount('#app') 