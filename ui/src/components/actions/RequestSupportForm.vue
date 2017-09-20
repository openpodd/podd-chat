<template>
  <div>
    <strong>สิ่งที่ต้องการขอการสนับสนุน</strong>
    <div>
      <label><input type="checkbox" v-model="resources.food"> เสบียงอาหาร</label>
    </div>
    <div>
      <label><input type="checkbox" v-model="resources.crews"> กำลังพล</label>
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
    data () {
      return {
        resources: {
          food: false,
          crews: false,
          equipments: false
        },
        others: ''
      }
    },
    methods: {
      async submit () {
        let payload = {
          type: 'action',
          actionType: 'requestSupport',
          resources: this.resources,
          others: this.others
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
