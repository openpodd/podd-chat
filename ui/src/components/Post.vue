<template>
  <div class="post">
    <form class="chat-form" @submit.prevent="post()">
      <input type="text" class="chat-form__input" v-model="message"></input>
      <button class="chat-form__submit" type="submit">ส่ง</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'post',
  data () {
    return {
      message: ''
    }
  },
  methods: {
    post () {
      this.$store.dispatch('postMessage', this.message)
      this.message = ''
    }
  }
}
</script>

<style lang="less">
.post {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  padding: .75em;
  background-color: #fff;
  box-shadow: -1px 0 5px #ccc;
}

.chat-form {
  width: 100%;
  height: 100%;

  &__input {
    float: left;
    width: 85%;
    height: 100%;
    padding: 4px;
    border: none;
    // border-radius: .25rem;
    box-shadow: 0 0 2px #dcdcdc inset;
    background-color: #eee;
  }
  &__submit {
    width: 15%;
    height: 100%;
    border: none;
    color: #fff;
    background-color: #11ad51;
  }
}
</style>