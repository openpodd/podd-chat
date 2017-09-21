<template>
  <a class="message__avatar" :class="{'message__avatar_sender': isMine }">
    <img v-if="!hasAvatar" class="message__avatar_image" :src="`https://api.adorable.io/avatars/35/${ message.username }@podd.png`">
    <img v-if="hasAvatar" class="message__avatar_image" :src="`${ apiUrl }/users/${ message.userId }/profile_image/`">
  </a>
</template>


<script>
  import Vue from 'vue'
  export default {
    name: 'avatar',
    props: ['message'],
    computed: {
      isMine () {
        return this.message.username === this.$store.state.user.username || this.message.userId === this.$store.state.user.id
      },
      hasAvatar () {
        return this.message.userId && this.message.userId !== 0 && this.message.userId !== '0'
      },
      apiUrl () {
        return Vue.config.apiUrl
      }
    }
  }
</script>


<style lang="less">
  .message {
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
  }
</style>
