<template>
  <div class="modal">
    <div class="-backdrop" @click="close()"></div>
    <div class="-content">
      <h1>{{ title }}</h1>
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Modal',
  props: ['title'],
  methods: {
    close () {
      this.$emit('modalClose')
    }
  }
}
</script>

<style scoped lang="less">
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  overflow: auto;

  h1 {
    margin: 0;
  }

  .-backdrop {
    position: fixed;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    background-color: #000;
    opacity: .8;
    z-index: -1;
  }

  .-content {
    margin: 70px 20px 10px 20px;
    padding: 12px;

    border-radius: .25rem;
    box-shadow: 0 0 2px #dcdcdc inset;
    background-color: #fff;
  }
}
</style>
