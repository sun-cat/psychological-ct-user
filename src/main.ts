import App from './App.vue'
import { createApp, nextTick } from 'vue'
import { initStore } from './store'                 // Store
import { initRouter } from './router'               // Router
import language from './locales'                    // 国际化
import '@styles/core/tailwind.css'                       // tailwind
import '@styles/index.scss'                         // 样式
import { setupGlobDirectives } from './directives'
import { setupErrorHandle } from './utils/sys/error-handle'
import { useUserStore } from '@/store/modules/user'

document.addEventListener(
  'touchstart',
  function () {},
  { passive: false }
)

// 检查是否在 iframe 中运行
const isInIframe = window.self !== window.top

/**
 * 初始化应用
 */
function initApp() {
  const app = createApp(App)
  initStore(app)
  initRouter(app)
  setupGlobDirectives(app)
  setupErrorHandle(app)

  app.use(language)
  app.mount('#app')
}

/**
 * 等待父窗口发送 token
 */
interface TokenAndUserData {
  token: string
  userInfo?: any
}

function waitForToken(): Promise<TokenAndUserData> {
  return new Promise((resolve) => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'SET_TOKEN_AND_USER' && event.data.token) {
        window.removeEventListener('message', handleMessage)
        console.log('✅ 已从父窗口接收 token 和用户信息')
        resolve({
          token: event.data.token,
          userInfo: event.data.userInfo
        })
      }
    }
    
    window.addEventListener('message', handleMessage)
    
    // 设置超时，避免无限等待（5秒后自动继续）
    setTimeout(() => {
      window.removeEventListener('message', handleMessage)
      console.warn('⚠️ 等待父窗口 token 超时，继续初始化应用')
      resolve({ token: '', userInfo: null })
    }, 5000)
  })
}

/**
 * 临时保存 token 和用户信息，等待 store 初始化后再设置
 */
function setTokenAndUserToStorage(data: TokenAndUserData) {
  if (!data.token) return
  
  try {
    // 将数据临时保存到 window 对象，等待 Pinia store 初始化后再设置
    (window as any).__PENDING_USER_DATA__ = data
    console.log('✅ 用户数据已准备就绪，等待 store 初始化')
  } catch (error) {
    console.error('❌ 保存用户数据失败:', error)
  }
}

/**
 * 将数据设置到 Pinia store（在应用初始化后调用）
 */
function applyPendingUserData() {
  const pendingData = (window as any).__PENDING_USER_DATA__
  if (!pendingData) return
  
  try {
    const userStore = useUserStore()
    
    // 设置 token 和登录状态
    userStore.setToken(pendingData.token)
    userStore.setLoginStatus(true)
    
    // 设置用户信息
    if (pendingData.userInfo) {
      userStore.setUserInfo(pendingData.userInfo)
      console.log('✅ 用户信息已设置到 Pinia store')
    }
    
    // 清理临时数据
    delete (window as any).__PENDING_USER_DATA__
    console.log('✅ Token 和用户信息已成功设置')
  } catch (error) {
    console.error('❌ 设置用户数据到 store 失败:', error)
  }
}

// 主流程
if (isInIframe) {
  console.log('🔍 检测到在 iframe 中运行，等待父窗口发送 token...')
  
  // 等待 token 和用户信息后再初始化应用
  waitForToken().then((data) => {
    if (data.token) {
      setTokenAndUserToStorage(data)
    }
    initApp()
    
    // 应用初始化后，将数据设置到 Pinia store
    nextTick(() => {
      applyPendingUserData()
    })
  })
} else {
  // 不在 iframe 中，直接初始化应用
  initApp()
}
