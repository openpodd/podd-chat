// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router/index'
import App from './App'
import store from './store'
import * as VueGoogleMaps from 'vue2-google-maps'
import config from './store/config'

const firebase = require('firebase')
firebase.initializeApp(config.firebase)

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

import validator from './validator'
import './main.less'

Vue.use(validator)

Vue.config.productionTip = false
Vue.config.apiUrl = config.apiUrl

Vue.$firebase = firebase
Vue.prototype.$firebase = firebase

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  store: store,
  components: { App }
})
