<template>
  <div class="modal">
    <div class="-backdrop" @click="close()"></div>
    <div class="-content">
      <h1>{{ title }}</h1>
      <slot></slot>
      <div class="-close" @click="close()"><span class="close heavy"></span></div>
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

  #div1 {
  float:right;
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
    position: relative;
    margin: 70px 20px 10px 20px;
    padding: 12px;

    border-radius: .25rem;
    box-shadow: 0 0 2px #dcdcdc inset;
    background-color: #fff;
  }
}

.-close {
  position: absolute;
  top: 25px;
  right: 15px;
}

.close {
  position: relative;
  display: inline-block;
  width: 25px;
  height: 25px;
  overflow: hidden;

  &:hover {
    &::before, &::after {
      background: #999;
      cursor: pointer;
    }
  }

  &:before, &::after {
    content: '';
    position: absolute;
    height: 2px;
    width: 100%;
    top: 50%;
    left: 0;
    margin-top: -1px;
    background: #000;
  }
  &::before {
    transform: rotate(45deg);
  }
  &::after {
    transform: rotate(-45deg);
  }
  &.heavy {
    &::before, &::after {
      height: 5px;
      margin-top: -6px;
    }
  }
}

</style>
