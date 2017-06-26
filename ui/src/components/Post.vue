<template>
  <div>
    <input type="text" v-model="message"/>
    <button @click="post()">Post</button>
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
      console.log('post ', this.message)
      this.$store.dispatch('postMessage', this.message)
    }
  }
}
</script>
