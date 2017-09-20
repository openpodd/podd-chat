import Vue from 'vue'
import Router from 'vue-router'
import ChatRoom from '../components/pages/ChatRoom.vue'
import EccDashboard from '../components/pages/EccDashboard.vue'

Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/',
      component: ChatRoom
    },
    {
      path: '/dashboard',
      component: EccDashboard
    }
  ]
})

export default router
