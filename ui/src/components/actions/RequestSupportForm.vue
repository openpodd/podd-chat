<template>
  <div>
    <strong>สิ่งที่ต้องการขอการสนับสนุน</strong>
    <div>
      <label><input type="checkbox" v-model="resources.food"> เสบียงอาหาร</label>
    </div>
    <div>
      <label>
        <input type="checkbox" v-model="resources.crews">
        กำลังพล
        จำนวน <input type="number" v-model="resources.crewsNumber"> คน
      </label>
    </div>
    <div>
      <label><input type="checkbox" v-model="resources.equipments"> อุปกรณ์</label>
    </div>

    <strong>ข้อความเพิ่มเติม</strong>
    <div>
      <textarea class="form-control" name="others" v-model="others" rows="3"></textarea>
    </div>

    <button class="btn" @click.prevent="submit()">ยืนยัน</button>
    <button class="btn btn-cancel" @click.prevent="cancel()">ยกเลิก</button>
  </div>
</template>

<script>
  export default {
    name: 'RequestSupportForm',
    props: {
      tokenInfo: {
        type: Object,
        required: true
      }
    },
    data () {
      return {
        resources: {
          food: false,
          crews: false,
          crewsNumber: 0,
          equipments: false
        },
        others: ''
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
            actionType: 'requestSupport',
            resources: this.resources,
            others: this.others,
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
