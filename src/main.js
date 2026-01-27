import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

// 导入样式
import './styles/editor.css'

// 注册内置块
import './block-library/index.js'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')
