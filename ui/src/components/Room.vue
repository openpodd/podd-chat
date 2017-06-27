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
        <div class="message" v-for="msg in messages">
          <a class="message__avatar" :class="{'message__avatar_sender': isMine(msg) }">
            <img v-if="!hasAvatar(msg)" class="message__avatar_image" :src="`https://api.adorable.io/avatars/35/${ msg.username }@podd.png`">
            <img v-if="hasAvatar(msg)" class="message__avatar_image" :src="`${ apiUrl }/users/${ msg.userId }/profile_image/`">
          </a>
          <div class="message__content" :class="{'message__content_sender': isMine(msg) }">
            <a class="message__author">{{msg.username}}</a>
            <div class="message__metadata">
              <span class="message__date">เมื่อ {{ msg.ts | moment("from") }}</span>
            </div>
            <div class="message__text">
              {{msg.message}}
            </div>
          </div>
        </div>
      </div>

      <div class="new_message" v-if="notifyNewMessage" @click="scrollBottom()">มีข้อความใหม่ ↓</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'room',
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
    hasAvatar (message) {
      return message.userId && message.userId !== 0 && message.userId !== '0'
    },
    isMine (message) {
      return message.username === this.$store.state.username || message.userId === this.$store.state.userId
    },
    scrollBottom () {
      this.notifyNewMessage = false
      let body = document.getElementsByTagName('body')[0]
      window.scrollTo(0, body.scrollHeight)
      this.willScrollBottom = false
    },
    onScroll (ev) {
      let el = document.scrollingElement
      console.log(el.scrollTop + window.innerHeight, el.scrollHeight)
      if (this.notifyNewMessage && (el.scrollTop + window.innerHeight) === el.scrollHeight) {
        this.notifyNewMessage = false
      }
    }
  },
  computed: {
    apiUrl () {
      return this.$store.state.apiUrl
    },
    roomName () {
      return this.$store.state.roomName
    },
    userAvatar: function () {
      let userId = this.$store.state.userId
      return (userId && userId !== '0') ? `${this.apiUrl}/users/${userId}/profile_image/` : `https://api.adorable.io/avatars/35/${this.$store.state.username}@podd.png`
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

.message {
  position: relative;
  background: 0 0;
  margin: .5em 0 0;
  padding: .5em 0 0;
  border: none;
  border-top: none;
  line-height: 1.2;

  &__avatar {
    display: block;
    width: 2.5em;
    height: auto;
    float: left;
    margin: .2em 0 0;
  }
  &__avatar_image {
    display: block;
    margin: 0 auto;
    width: 100%;
    height: 100%;
    border-radius: .25rem;
  }
  &__avatar_sender {
    float: right;
  }
  &__content {
    margin-left: 3.5em;
    padding: .5em;
    background-color: #fff;
    border-radius: .25rem;
    box-shadow: 0 1px 2px #acacac;
  }
  &__content_sender {
    margin: 0 3.5em 0 0;
    background-color: #fdfbc3;
  }
  &__author {
    font-size: 1em;
    color: rgba(0,0,0,.87);
    font-weight: 500;
  }
  &__metadata {
    display: inline-block;
    margin-left: .3em;
    color: rgba(0,0,0,.4);
    font-size: .775em;
  }
  &__date {
    display: inline-block;
    margin: 0 .5em 0 0;
  }
  &__text {
    margin: .5em 0 0;
    font-size: 1em;
    word-wrap: break-word;
    color: rgba(0,0,0,.87);
    line-height: 1.3;
    user-select: text;
  }
}
</style>
