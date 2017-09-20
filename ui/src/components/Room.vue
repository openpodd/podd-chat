<template>
  <div class="room">
    <div class="chat-header">
      <p class="chat-header__title">
        {{ roomName }}
      </p>
      <div class="chat-header__user">
        <img :src="userAvatar">
      </div>
    </div>
    <div class="chat-log">
      <div class="messages">
        <message v-bind:message="msg" v-for="msg in messages" :key="msg.id"></message>
      </div>

      <div class="new_message" v-if="notifyNewMessage" @click="scrollBottom()">มีข้อความใหม่ ↓</div>
    </div>
  </div>
</template>

<script>
import Message from './Message'

export default {
  name: 'room',
  components: {
    Message
  },
  data () {
    return {
      willScrollBottom: false,
      notifyNewMessage: false
    }
  },
  created () {
    window.addEventListener('scroll', this.onScroll, false)
  },
  updated () {
    if (this.willScrollBottom) {
      this.scrollBottom()
    }
  },
  destroyed () {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    scrollBottom () {
      this.notifyNewMessage = false
      let body = document.getElementsByTagName('body')[0]
      window.scrollTo(0, body.scrollHeight)
      this.willScrollBottom = false
    },
    onScroll (ev) {
      let el = document.scrollingElement
      if (this.notifyNewMessage && (el.scrollTop + window.innerHeight) === el.scrollHeight) {
        this.notifyNewMessage = false
      }
    }
  },
  computed: {

    roomName () {
      return this.$store.state.roomName
    },
    userAvatar: function () {
      let userId = this.$store.state.userId
      return (userId && userId !== '0') ? `${this.$store.state.apiUrl}/users/${userId}/profile_image/` : `https://api.adorable.io/avatars/35/${this.$store.state.username}@podd.png`
    },
    username: function () {
      return this.$store.state.username
    },
    messages () {
      return this.$store.state.messages
    }
  },
  watch: {
    messages (val) {
      if (val[val.length - 1].userId !== this.$store.state.userId) {
        let el = document.scrollingElement
        if ((el.scrollTop + window.innerHeight) === el.scrollHeight && el.scrollHeight >= window.outerHeight) {
          this.willScrollBottom = true
        } else if (el.scrollHeight >= window.innerHeight) {
          this.notifyNewMessage = true
        }
      }
    }
  }
}
</script>

<style lang="less">
.chat-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;

  margin: 0 0 1em;
  color: #fff;
  background-color: #1F2A39;
  border-bottom: 3px solid #19232E;
  z-index: 9;

  &__user {
    display: block;
    text-align: center;
    position: absolute;
    top: 10px;
    right: 10px;

    img {
      width: 2em;
      margin: .2em 0 0;
      border-radius: .25rem;
      vertical-align: middle;
    }
  }

  &__title {
    margin: 0;
    padding: 1em 0;
    font-size: 1.2em;
    margin-left: .5em;
    line-height: 1;
    text-align: left;
  }
}


.new_message {
  position: fixed;
  bottom: 70px;
  left: 50%;
  border-radius: 3em;
  box-shadow: 0 1px 2px #acacac;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 1);
  opacity: .7;
  transform: translateX(-50%);
}

.messages {
  margin: .5em;
}
.chat-log {
  padding-top: 60px;
  padding-bottom: 70px;
}

</style>
