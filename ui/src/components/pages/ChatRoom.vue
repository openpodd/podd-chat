<template>
  <div class="chatroom" :class="{ '-fixed': fixed }">
    <room class="-room"></room>
    <post class="-post"></post>
  </div>
</template>

<script>
import Room from '../Room'
import Post from '../Post'

export default {
  name: 'ChatRoom',
  props: {
    fixed: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  components: {
    Room,
    Post
  },
  created () {
    this.$store.dispatch('initChatRoom')
  }
}
</script>

<style lang="less" scoped>
.chatroom {
  display: flex;
  flex-direction: column;
  position: relative;
  height: 100%;

  &.-fixed {
    position: fixed;
  }
}

.-room {
  padding-bottom: 60px;
}
</style>
