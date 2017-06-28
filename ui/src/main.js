// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import store from './store'
import * as VueGoogleMaps from 'vue2-google-maps'
import config from './store/config'

const moment = require('moment')
require('moment/locale/th')

Vue.use(require('vue-moment'), {
  moment
})

Vue.use(VueGoogleMaps, {
  load: {
    key: config.googleMapApiKey
  }
})

import './main.less'

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  store: store,
  components: { App }
})
