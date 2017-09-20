<template>
  <div id="app">
    <router-view></router-view>
    <vue-modal ref="modal"></vue-modal>
  </div>
</template>

<script>

import Vue from 'vue'
import VueModal from './Modal'

export default {
  name: 'app',
  components: {
    VueModal
  },
  computed: {
    username: function () {
      return this.$store.state.username
    },
    token: function () {
      return this.$store.state.token
    }
  },
  created: function () {
    console.log('get username from firebase')
  },
  mounted () {
    Vue.prototype.$modal = this.$refs.modal
  }
}
</script>
