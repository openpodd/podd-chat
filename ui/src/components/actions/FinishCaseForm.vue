<template>
  <div>
    <div>
      ประเมินพื้นที่ความเสียหาย
      <input type="number" v-model="area">
      ไร่
    </div>
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
        area: 0
      }
    },
    methods: {
      async submit () {
        let payload = {
          roomId: this.tokenInfo.roomId.toString(),
          token: this.tokenInfo.key,
          message: {
            type: 'action',
            actionType: 'finishCase',
            area: this.area,
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
