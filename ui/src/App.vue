<template>
  <div id="app">
    <room></room>
    <post></post>
  </div>
</template>

<script>
import Room from './components/Room'
import Post from './components/Post'

export default {
  name: 'app',
  components: {
    Room,
    Post
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
  }
}
</script>
