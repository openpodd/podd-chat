<template>
  <div id="app">
    <p>hello {{ username }} with token {{ token }}</p>
    <room></room>
  </div>
</template>

<script>
import Room from './components/Room'
export default {
  name: 'app',
  components: {
    Room
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

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
