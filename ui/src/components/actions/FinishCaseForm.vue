<template>
  <div>
    <p>ท่านต้องการยืนยันหรือไม่?</p>
    <button class="btn" @click.prevent="submit()">ยืนยัน</button>
    <button class="btn btn-cancel" @click.prevent="cancel()">ยกเลิก</button>
  </div>
</template>

<script>
  export default {
    name: 'FinishCaseForm',
    props: {
      tokenInfo: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
      }
    },
    methods: {
      async submit () {
        let payload = {
          roomId: this.tokenInfo.roomId.toString(),
          message: {
            type: 'action',
            actionType: 'finishCase',
            userId: this.tokenInfo.userId,
            username: this.tokenInfo.username
          }
        }
        await this.$store.dispatch('postMessage', payload)
        this.$emit('actionDone')
      },
      cancel () {
        this.$emit('actionCancel')
      }
    }
  }
</script>

<style lang="less" scoped>
.btn {
  margin-top: 12px;
}
</style>
