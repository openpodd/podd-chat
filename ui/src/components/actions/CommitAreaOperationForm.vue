<template>
  <div>
    <strong>หน่วยงานที่ลงพื้นที่</strong>
    <input type="text" v-model="department">
    <div class="alert --error" v-show="$v.$errors.department.empty">กรุณากรอกหน่วยงาน</div>

    <div>
      <strong>กำลังคน</strong>
      <input type="number" v-model="crewsNumber"> คน
    </div>

    <button class="btn" @click.prevent="submit()">ยืนยัน</button>
    <button class="btn btn-cancel" @click.prevent="cancel()">ยกเลิก</button>
  </div>
</template>

<script>
export default {
  name: 'CommitAreaOperationForm',
  props: {
    tokenInfo: {
      type: Object,
      required: true
    },
    initialDepartment: {
      type: String,
      required: false,
      default: ''
    }
  },
  data () {
    return {
      department: this.initialDepartment,
      crewsNumber: ''
    }
  },
  created () {
    this.$v = this.$validator.init(this, {
      department: {
        checkEmpty: true
      }
    })
  },
  methods: {
    async submit () {
      if (!this.$v.validate()) {
        this.$forceUpdate()
        return
      }

      let payload = {
        roomId: this.tokenInfo.roomId.toString(),
        token: this.tokenInfo.key,
        message: {
          type: 'action',
          actionType: 'commitAreaOperation',
          department: this.department,
          crewsNumber: parseInt(this.crewsNumber, 10) || 0,
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
input[type=text] {
  width: 100%;
}

input[type=number] {
  width: 80px;
}

.btn {
  margin-top: 12px;
}
</style>
