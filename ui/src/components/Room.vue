<template>
  <div class="room">
    <div class="chat-header">
      <p class="chat-header__title">{{ roomName }}</p>
    </div>
    <div class="chat-log">
      <div class="messages">
        <div class="message" v-for="msg in messages">
          <a class="message__avatar">
            <img class="message__avatar_image" src="https://api.adorable.io/avatars/35/fufu.png">
          </a>
          <div class="message__content">
            <a class="message__author">{{msg.username}}</a>
            <div class="message__metadata">
              <span class="message__date">เมื่อเวลา 12:30 AM</span>
            </div>
            <div class="message__text">
              {{msg.message}}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'room',
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

  &__title {
    margin: 0;
    padding: 1em 0;
    font-size: 1.2em;
    line-height: 1;
    text-align: center;
  }
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
  }
}
</style>
