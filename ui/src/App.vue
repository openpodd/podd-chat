<template>
  <div id="app">
    <room></room>
    <post></post>

    <vue-modal ref="modal"></vue-modal>
  </div>
</template>

<script>
import Room from './components/Room'
import Post from './components/Post'

import Vue from 'vue'
import VueModal from './Modal'

export default {
  name: 'app',
  components: {
    Room,
    Post,
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
    this.$store.dispatch('init')
  },
  mounted () {
    Vue.prototype.$modal = this.$refs.modal
  }
}
</script>
