import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'
import { essScrollbar } from './directives/essScrollbar.js'

const app = createApp(App)
app.use(router)
app.directive('ess-scrollbar', essScrollbar)
app.mount('#app')
