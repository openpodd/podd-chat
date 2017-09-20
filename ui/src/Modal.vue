<template>
  <div class="vue-modal" :class="opts.classes" v-show="visible" ref="wrapper">
    <div class="__outside" @click="hide()"></div>
    <div class="__wrap">
      <div class="__header">
        <h2 class="__title">{{ opts.title }}</h2>
      </div>
      <div class="__body">
        <p v-html="opts.text"></p>

        <div class="loader" v-show="opts.showLoader"></div>

        <div class="text-center">
          <button class="btn btn-outline-secondary" @click="cancel()" v-show="opts.cancelButton">{{ opts.cancelButtonText }}</button>
          <button class="btn btn-outline-primary" @click="ok()" v-show="opts.okButton" ref="ok">{{ opts.okButtonText }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

const defaultOptions = {
  title: '',
  text: '',
  cancelButtonText: 'ยกเลิก',
  okButtonText: 'ตกลง',
  cancelButton: false,
  okButton: true,
  showLoader: false,
  classes: ''
}

export default {
  name: 'VueModal',
  data () {
    return {
      visible: false,
      opts: Object.assign({}, defaultOptions)
    }
  },
  methods: {
    show (options) {
      this.opts = Object.assign({}, defaultOptions, options)
      this.visible = true
      if (this.$refs.ok) {
        setTimeout(() => this.$refs.ok.focus(), 100)
      }
    },
    hide () {
      this.visible = false
    },
    ok () {
      this.opts['ok'] && this.opts['ok'].call(this)
      this.visible = false
    },
    cancel () {
      this.opts['cancel'] && this.opts['cancel'].call(this)
      this.visible = false
    }
  }
}
</script>

<style lang="less" scoped>
.vue-modal {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 9999;

  .__outside {
    position: fixed;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  // Layout
  .__wrap {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    max-width: none;
    width: 100%;
    height: auto;
    padding: 20px;
    background-color: #fff;

    @include media(">tablet") {
      max-width: 600px;
    }
  }
  .__header {}
  .__body {}

  // Elements
  .__title {

  }

  &.email-modal {
    overflow: auto;

    .__wrap {
      top: 40px;
      transform: translateX(-50%);
      margin-bottom: 40px;
      max-width: 800px;
    }
  }
}
</style>
