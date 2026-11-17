import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VChart from './components/ui/VChart.vue'
import './styles/global.css'
import './styles/components.css'

const app = createApp(App)
app.use(router)
// 全局注册图表组件，页面里直接用 <VChart :option="..." />
app.component('VChart', VChart)
app.mount('#app')
