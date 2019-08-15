import Vue from 'vue'
import App from './App.vue'
import router from './router'
import IvueMaterial from 'ivue-material'
import VueRouter from 'vue-router'

import 'ivue-material/dist/styles/ivue.css'

Vue.use(VueRouter)
Vue.use(IvueMaterial)

Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App),
}).$mount('#app')
