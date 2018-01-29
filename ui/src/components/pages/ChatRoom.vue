<template>
    <div class="chatroom" :class="{ '-fixed': fixed }" v-if="chatroom">
      <room class="-room" :chatroom="chatroom" :tokenInfo="tokenInfo" ref="room"></room>
      <post class="-post" :chatroom="chatroom" :tokenInfo="tokenInfo" @postDone="goBottom()" @focus="goBottom()"></post>
    </div>
    <div v-else>ไม่สามารถแสดง chatroom ได้ เนื่องจากไม่พบรหัส token</div>

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
    },
    token: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    return {
      tokenInfo: null,
      chatroom: null
    }
  },
  components: {
    Room,
    Post
  },
  created () {
    if (this.token) {
      this.fetch(this.token)
    } else {
      if (this.$route.params.token) {
        this.fetch(this.$route.params.token)
      } else {
        this.fetch(this.$route.query.token)
      }
    }
  },
  methods: {
    fetch: function (token) {
      if (!token) {
        return
      }
      this.chatroom = null

      this.$store.dispatch('fetchToken', token).then(tokenInfo => {
        this.tokenInfo = tokenInfo
        return this.$store.dispatch('fetchChatroom', {
          domainId: this.tokenInfo.domainId,
          roomId: this.tokenInfo.roomId
        })
      }).then(chatroom => {
        this.chatroom = chatroom
        return this.$store.dispatch('joinChatroom', {room: chatroom, token, domainId: this.tokenInfo.domainId})
      })
    },
    goBottom () {
      this.$refs.room.scrollBottom()
    }
  },
  watch: {
    '$route': function (to) {
      this.fetch(to.query.token)
    },
    token (newVal, oldVal) {
      this.fetch(newVal)
    }
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
    top: 0;
    left: 0;
    right: 0;
  }
}

.-room {
  /*padding-bottom: 60px;*/
}
</style>
