<template>
  <div class="pricing-page">
    <main class="pricing-container">
      <h1 class="pricing-title">选择您的计划</h1>
      <p class="pricing-subtitle">体验 Raphael AI 的最佳功能：更快的生成速度和商业使用权限</p>
      
      <!-- 价格选择开关 -->
      <div class="pricing-toggle">
        <span>月付</span>
        <el-switch v-model="isYearly" class="pricing-toggle-switch" />
        <span>年付</span>
        <span class="discount-tag">节省20%</span>
      </div>
      
      <!-- 价格卡片 -->
      <div class="pricing-cards">
        <!-- 高级版 -->
        <div class="pricing-card">
          <div class="pricing-card-header">
            <h2>高级版</h2>
            <p class="pricing-description">{{ planPeriod }}</p>
          </div>
          <div class="pricing-card-price">
            <span class="price-currency">$</span>
            <span class="price-amount">{{ highTierPrice }}</span>
            <span class="price-period">/月</span>
          </div>
          <div class="pricing-card-features">
            <ul>
              <li>
                <el-icon><Check /></el-icon>
                无限制图像生成
              </li>
              <li>
                <el-icon><Check /></el-icon>
                快速生成（5倍速）
                <el-tooltip content="比免费版生成速度快5倍" placement="top">
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </li>
              <li>
                <el-icon><Check /></el-icon>
                无广告
              </li>
              <li>
                <el-icon><Check /></el-icon>
                无水印
              </li>
            </ul>
          </div>
          <div class="pricing-card-footer">
            <button class="custom-button primary-button plain-button">升级到高级版</button>
          </div>
        </div>
        
        <!-- 旗舰版 -->
        <div class="pricing-card highlighted">
          <div class="pricing-card-header">
            <div class="popular-tag">最受欢迎</div>
            <h2>旗舰版</h2>
            <p class="pricing-description">{{ planPeriod }}</p>
          </div>
          <div class="pricing-card-price">
            <span class="price-currency">$</span>
            <span class="price-amount">{{ premiumTierPrice }}</span>
            <span class="price-period">/月</span>
          </div>
          <div class="pricing-card-features">
            <ul>
              <li>
                <el-icon><Check /></el-icon>
                无限制图像生成
              </li>
              <li>
                <el-icon><Check /></el-icon>
                最快生成速度
                <el-tooltip content="最高优先级的图像生成速度" placement="top">
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </li>
              <li>
                <el-icon><Check /></el-icon>
                无广告
              </li>
              <li>
                <el-icon><Check /></el-icon>
                无水印
              </li>
              <li>
                <el-icon><Check /></el-icon>
                高级优化功能
                <el-tooltip content="访问高级优化设置和增强工具" placement="top">
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </li>
              <li>
                <el-icon><Check /></el-icon>
                私密生成
                <el-tooltip content="您的图像不会在公共画廊中展示" placement="top">
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </li>
              <li>
                <el-icon><Check /></el-icon>
                抢先体验新功能
                <el-tooltip content="优先访问最新发布的功能" placement="top">
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </li>
            </ul>
          </div>
          <div class="pricing-card-footer">
            <button class="custom-button primary-button">升级到旗舰版</button>
          </div>
        </div>
        
        <!-- 企业版 -->
        <div class="pricing-card">
          <div class="pricing-card-header">
            <h2>Enterprise</h2>
            <p class="pricing-description">企业级解决方案</p>
          </div>
          <div class="pricing-card-price">
            <span class="price-amount">定制</span>
          </div>
          <div class="pricing-card-features">
            <ul>
              <li>
                <el-icon><Check /></el-icon>
                完全隐私
                <el-tooltip content="企业级数据安全和隐私保护" placement="top">
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </li>
              <li>
                <el-icon><Check /></el-icon>
                定制模型
              </li>
              <li>
                <el-icon><Check /></el-icon>
                定制集成
              </li>
              <li>
                <el-icon><Check /></el-icon>
                专属支持
              </li>
              <li>
                <el-icon><Check /></el-icon>
                API 访问
              </li>
              <li>
                <el-icon><Check /></el-icon>
                高容量
              </li>
            </ul>
          </div>
          <div class="pricing-card-footer">
            <button class="custom-button primary-button plain-button">即将推出</button>
          </div>
        </div>
      </div>
      
      <!-- 常见问题 FAQ -->
      <div id="faq" class="faq-section">
        <h2>常见问题</h2>
        <p class="faq-subtitle">获取有关我们订阅计划的常见问题的答案</p>
        <div class="faq-container">
          <div v-for="(faq, index) in faqs" :key="index" class="faq-item">
            <div 
              class="faq-question" 
              @click="togglePanel(index)"
              :class="{ 'active': !collapsedPanels[index] }"
            >
              <h3>{{ faq.question }}</h3>
              <el-icon class="faq-icon" :class="{ 'rotate': !collapsedPanels[index] }">
                <ArrowDown />
              </el-icon>
            </div>
            <div class="faq-answer" v-show="!collapsedPanels[index]">
              <div v-html="formatText(faq.answer)"></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ArrowDown, Check, InfoFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 价格切换
const isYearly = ref(true)

// 根据付款方式计算价格
const highTierPrice = computed(() => isYearly.value ? 10 : 12)
const premiumTierPrice = computed(() => isYearly.value ? 20 : 24)
const planPeriod = computed(() => isYearly.value ? '按年收费' : '按月收费')

// FAQ数据
const faqs = computed(() => [
  {
    question: '为什么要订阅？',
    answer: '您的支持有助于我们免费保持该网站，并带来一些宝贵的好处！\n\n• 您的图像不会有水印！\n\n• 它更快，您优先于其他用户。当有一个队列生成图像时，我们会将您移到前面，这在流量较高时特别有用！\n\n• 您的图像是完全私人的，不会在我们的公共画廊或建议的图像中共享。\n\n• 您将没有任何广告！'
  },
  {
    question: '我可以升级还是取消？',
    answer: '随时！\n您可以从帐户设置页面一单击中升级或取消。\n您的订阅贯穿您的订阅期限，但从来没有合同。'
  },
  {
    question: '我可以退款吗？',
    answer: '不，我们的销售额不退还。'
  },
  {
    question: '您要提高价格吗？',
    answer: '可能...当我们试图使计划负担得起时，我们还添加了更多功能并建立更强大的模型，这些模型的成本更高。\n但是，如果您购买年度计划，我们会很乐意尊重它。'
  },
  {
    question: '如果我订阅，我会得到更高质量的图像吗？',
    answer: '是的！\n尤其是在付费计划中可用的精炼图像功能的情况下，您会注意到图像质量和细节的显着改善。'
  },
  {
    question: '如果我订阅，我仍然会收到"流量过多"？',
    answer: '在正常使用情况下，您不会遇到此消息。但是，如果我们的系统检测到异常使用模式（例如反向工程尝试或其他未经授权的方法），则可能仍然会看到此消息。'
  },
  {
    question: '我可以使用该产品获得帮助吗？',
    answer: '是的！\n您可以通过电子邮件support@raphael.ai与我们联系，以获取所需的任何帮助。'
  },
  {
    question: '企业级别是什么？',
    answer: '如果您有独特的用例，并且想了解有关定价的更多信息，请通过sales@raphael.ai与我们联系。'
  },
  {
    question: '我必须是商业使用图像的订户吗？',
    answer: '否。只要您尊重使用条款，就可以随意使用我们的图像，以期为个人，学术或商业用途！\n如果您是免费的订户，请归功于Raphael.ai的图像。'
  },
  {
    question: '我的订阅包括API访问吗？',
    answer: '不，目前我们没有公共API，但将在不久的将来提供。\n我们很想听听您的特定要求。'
  }
])

// 初始化所有面板为展开状态（设置为false表示不折叠）
const collapsedPanels = ref(Array(faqs.value.length).fill(false))

// 切换面板展开/折叠状态
const togglePanel = (index: number) => {
  collapsedPanels.value[index] = !collapsedPanels.value[index]
}

// 格式化文本，处理嵌套列表
const formatText = (text: string) => {
  if (!text) return ''
  
  // 替换带缩进的嵌套列表项
  let formattedText = text.replace(/\n• (.*?)(?=\n|$)/g, '<li>$1</li>')
  
  // 替换带缩进的嵌套列表项（使用◦符号的嵌套项）
  formattedText = formattedText.replace(/\n  ◦ (.*?)(?=\n|$)/g, '<ul class="nested-list"><li>$1</li></ul>')
  
  // 替换以连字符开头的列表项
  formattedText = formattedText.replace(/\n- (.*?)(?=\n|$)/g, '<li>$1</li>')
  
  // 将所有列表项包装在ul标签中
  if (formattedText.includes('<li>')) {
    formattedText = '<ul>' + formattedText + '</ul>'
    
    // 修复嵌套列表的结构
    formattedText = formattedText.replace(/<\/li><ul class="nested-list">/g, '<ul class="nested-list">')
    formattedText = formattedText.replace(/<\/ul><\/li>/g, '</ul></li>')
    formattedText = formattedText.replace(/<\/ul><ul class="nested-list">/g, '')
  }
  
  // 替换换行符为段落
  formattedText = formattedText.replace(/\n\n/g, '</p><p>')
  
  // 包装在段落标签中
  if (!formattedText.startsWith('<ul>')) {
    formattedText = '<p>' + formattedText + '</p>'
  }
  
  return formattedText
}

onMounted(() => {
  console.log('价格页面已加载')
})
</script>

<style scoped>
.pricing-page {
  padding-top: 0;
  background-color: #1a1a1a;
  color: #ffffff;
  min-height: 100vh;
}

.pricing-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px 40px;
}

.pricing-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 6px;
}

.pricing-subtitle {
  font-size: 1.2rem;
  text-align: center;
  color: #aaaaaa;
  margin-bottom: 15px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

/* 价格选择开关 */
.pricing-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  gap: 16px;
}

.pricing-toggle-switch {
  --el-switch-on-color: #d4a055;
}

.discount-tag {
  background-color: #d4a055;
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.pricing-cards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 24px;
  margin-bottom: 60px;
}

.pricing-card {
  background-color: #2a2a2a;
  border-radius: 12px;
  width: 320px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.pricing-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.25);
}

.pricing-card.highlighted {
  border: 2px solid #d4a055;
  transform: scale(1.05);
}

.pricing-card.highlighted:hover {
  transform: translateY(-8px) scale(1.05);
}

.pricing-card-header {
  padding: 24px;
  position: relative;
}

.popular-tag {
  position: absolute;
  top: 0;
  right: 0;
  background-color: #d4a055;
  color: #ffffff;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
  border-bottom-left-radius: 8px;
}

.pricing-card-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #ffffff;
}

.pricing-description {
  color: #aaaaaa;
  font-size: 0.9rem;
  line-height: 1.5;
}

.pricing-card-price {
  padding: 16px;
  background-color: #222222;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.price-currency {
  font-size: 1.2rem;
  font-weight: 500;
  margin-right: 2px;
}

.price-amount {
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1;
}

.price-period {
  font-size: 0.9rem;
  color: #aaaaaa;
  margin-left: 2px;
}

.pricing-card-features {
  padding: 24px;
  flex-grow: 1;
}

.pricing-card-features ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.pricing-card-features li {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: #e0e0e0;
  font-size: 0.95rem;
}

.pricing-card-features li:last-child {
  margin-bottom: 0;
}

.pricing-card-features .el-icon {
  color: #d4a055;
  margin-right: 12px;
  font-size: 18px;
}

.info-icon {
  color: #888;
  margin-left: 6px;
  font-size: 14px;
  cursor: help;
}

.pricing-card-footer {
  padding: 24px;
  text-align: center;
}

.custom-button {
  width: 100%;
  font-weight: 600;
  font-size: 1rem;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  border: none;
  display: inline-block;
  text-align: center;
}

.primary-button {
  background-color: #409eff;
  color: white;
}

.primary-button:hover {
  background-color: #66b1ff;
}

.plain-button {
  background-color: transparent;
  border: 1px solid #409eff;
  color: #409eff;
}

.plain-button:hover {
  background-color: rgba(64, 158, 255, 0.1);
}

/* FAQ样式 */
.faq-section {
  padding-top: 30px;
  padding-bottom: 40px;
}

.faq-section h2 {
  font-size: 2rem;
  text-align: center;
  margin-bottom: 8px;
}

.faq-subtitle {
  text-align: center;
  color: #aaaaaa;
  font-size: 1.1rem;
  margin-bottom: 25px;
}

.faq-container {
  max-width: 800px;
  margin: 0 auto;
}

.faq-item {
  margin-bottom: 12px;
  border-radius: 12px;
  background-color: #2a2a2a;
  overflow: hidden;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.faq-question:hover {
  background-color: #333333;
}

.faq-question.active {
  background-color: #333333;
}

.faq-question h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.faq-icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.faq-icon.rotate {
  transform: rotate(180deg);
}

.faq-answer {
  padding: 0 20px 20px;
  color: #bbbbbb;
  line-height: 1.6;
  transition: all 0.3s ease-in-out;
}

.faq-answer p {
  margin-top: 0;
}

/* 响应式样式 */
@media (max-width: 1100px) {
  .pricing-cards {
    gap: 16px;
  }
  
  .pricing-card {
    width: 300px;
  }
}

@media (max-width: 960px) {
  .pricing-cards {
    flex-direction: column;
    align-items: center;
  }
  
  .pricing-card {
    width: 100%;
    max-width: 500px;
  }
  
  .pricing-card.highlighted {
    transform: scale(1);
    order: -1;
    margin-bottom: 16px;
  }
  
  .pricing-card.highlighted:hover {
    transform: translateY(-8px) scale(1);
  }
}

@media (max-width: 600px) {
  .pricing-container {
    padding: 40px 16px 20px;
  }
  
  .pricing-title {
    font-size: 2rem;
  }
  
  .pricing-subtitle {
    font-size: 1rem;
    margin-bottom: 32px;
  }
  
  .pricing-card-price {
    padding: 16px;
  }
  
  .price-amount {
    font-size: 3rem;
  }
  
  .faq-section h2 {
    font-size: 1.8rem;
  }
}

/* 列表样式 */
:deep(ul) {
  list-style: none;
  padding-left: 0;
}

:deep(li) {
  margin-bottom: 8px;
  position: relative;
  padding-left: 24px;
}

:deep(li::before) {
  content: '•';
  position: absolute;
  left: 0;
  color: #d4a055;
  font-size: 20px;
  line-height: 1;
}

:deep(ul.nested-list) {
  margin-top: 8px;
  margin-bottom: 0;
  padding-left: 20px;
}

:deep(ul.nested-list li::before) {
  content: '◦';
  font-size: 16px;
}
</style> 