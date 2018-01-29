<template>
  <div>
    <div>
      <label><input type="radio" name="severity" v-model="severity" value="low"> ไฟไม่รุนแรง</label>
    </div>
    <div>
      <label><input type="radio" name="severity" v-model="severity" value="high"> เริ่มเข้าสู่ช่วงวิกฤต</label>
    </div>
    <div>
      <label><input type="radio" name="severity" v-model="severity" value="danger"> เข้าขั้นวิกฤติ อันตราย</label>
    </div>

    <button class="btn" @click.prevent="submit()">ยืนยัน</button>
    <button class="btn btn-cancel" @click.prevent="cancel()">ยกเลิก</button>
  </div>
</template>

<script>
  export default {
    name: 'UpdateSituationForm',
    props: {
      tokenInfo: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        severity: ''
      }
    },
    methods: {
      async submit () {
        let payload = {
          roomId: this.tokenInfo.roomId.toString(),
          domainId: this.tokenInfo.domainId,
          token: this.tokenInfo.key,
          message: {
            type: 'action',
            actionType: 'updateSituation',
            severity: this.severity,
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
