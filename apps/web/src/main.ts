import '@/assets/base.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
// Element Plus 按需导入（组件和 CSS 由 unplugin-vue-components 自动处理）
// 中文语言包通过 App.vue 中的 <el-config-provider> 全局配置
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import focusPlugin from './directives/focus'
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(focusPlugin)

app.mount('#app')
