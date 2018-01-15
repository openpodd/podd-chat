// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import axios from 'axios'
import VueAxios from 'vue-axios'

Vue.use(VueAxios, axios)

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
Vue.getCookie = (cname) => {
  var name = cname + '='
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  store: store,
  components: { App }
})
