<template>
  <div>
    <strong>หน่วยงานที่ลงพื้นที่</strong>
    <input type="text" v-model="department">
    <div class="alert --error" v-show="$v.$errors.department.empty">กรุณากรอกหน่วยงาน</div>
    <button class="btn" @click.prevent="submit()">ยืนยัน</button>
    <button class="btn btn-cancel" @click.prevent="cancel()">ยกเลิก</button>
  </div>
</template>

<script>
export default {
  name: 'CommitAreaOperationForm',
  data () {
    return {
      department: ''
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
        type: 'action',
        actionType: 'commitAreaOperation',
        department: this.department
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

.btn {
  margin-top: 12px;
}
</style>
