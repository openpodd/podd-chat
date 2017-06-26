<template>
  <div class="room">
    <h1>Room {{ roomName }} {{ test }}</h1>
    <ul>
      <li v-for="msg in messages">{{msg.message}} by {{msg.username}}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'room',
  data () {
    return {
      test: 'hi'
    }
  },
  computed: {
    roomName () {
      return this.$store.state.roomName
    },
    messages () {
      return this.$store.state.messages
    }
  }
}
</script>
