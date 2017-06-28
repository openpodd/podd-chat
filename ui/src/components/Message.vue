<template>
  <div class="message">
    <avatar v-bind:message="message"></avatar>

    <div class="message__content" :class="{'message__content_sender': isMine }">
      <a class="message__author">{{message.username}}</a>
      <div class="message__metadata">
        <span class="message__date">เมื่อ {{ message.ts | moment("from") }}</span>
      </div>
      <div class="message__text">
        {{message.message}}
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from './Avatar'

export default {
  name: 'message',
  props: ['message'],
  components: {
    Avatar
  },
  computed: {
    isMine () {
      return this.message.userId && this.message.userId !== 0 && this.message.userId !== '0'
    }
  }
}
</script>

<style lang="less">
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
