import Vue from 'vue'
import Router from 'vue-router'
import ChatRoom from '../components/pages/ChatRoom.vue'
import EccDashboard from '../components/pages/EccDashboard.vue'
import LoginPage from '../components/pages/LoginPage.vue'

import store from '../store'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      component: ChatRoom
    },
    {
      path: '/dashboard',
      component: EccDashboard,
      meta: {
        requiredLogin: true
      }
    },
    {
      path: '/user/login',
      component: LoginPage
    }
  ]
})

router.beforeEach((to, from, next) => {
  if (window.location.pathname !== '/') {
    window.location = '/'
    return
  }

  store.dispatch('initUser')
  if (to.meta.requiredLogin) {
    if (!store.state.user) {
      next(`/user/login?next=${to.path}`)
    }
  }

  next()
})

export default router