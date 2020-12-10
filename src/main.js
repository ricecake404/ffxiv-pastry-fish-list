import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import i18n from './i18n'
import vuetify from './plugins/vuetify'
import { initTooltip } from '@thewakingsands/kit-tooltip'
import { Settings } from 'luxon'

initTooltip()
Settings.defaultLocale = 'zh-CN'

Vue.config.productionTip = false
// Vue.use(VueKonva) // no need to set plugin if import by CND

new Vue({
  router,
  store,
  i18n,
  vuetify,
  render: h => h(App),
}).$mount('#app')
