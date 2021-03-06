import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
// import router from './router'
import router from './x-router'
// import store from './store'
import store from './x-store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
