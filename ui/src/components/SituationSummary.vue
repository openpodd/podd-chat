<template>
  <div class="room-members">
    {{summary}}
  </div>
</template>

<script>
// import moment from 'moment'

export default {
  props: {
    tokenInfo: {
      type: Object,
      required: true
    },
    messages: {
      type: Array,
      required: true
    }
  },
  created () {
    this.$store.dispatch('fetchRoomMembers', {
      roomId: this.tokenInfo.roomId,
      domainId: this.tokenInfo.domainId
    })
  },
  computed: {
    members () {
      // keep a reference of members that are actively participating in this chat
      return this.$store.state.roomMembers.filter(m => m.joined && m.answered)
    },
    summary () {
      let lastLocationMsg = {}
      const actions = []

      this.messages.forEach(msg => {
        const hasLocation = msg.message.match(/พิกัด\s+[0-9.]+,\s+[0-9.]+/)
        if (hasLocation) {
          lastLocationMsg = msg
        } else {
          if (msg.type === 'action') {
            let detail = ''

            if (msg.actionType === 'commitAreaOperation') {
              detail = `ได้มีการยืนยันการลงพื้นที่ใน ${msg.ts} ของหน่วยงาน ${msg.department} จำนวน ${msg.crewsNumber} คน`
            } else if (msg.actionType === 'requestSupport') {
              detail = 'ขอความช่วยเหลือ'
              const r = msg.resources
              if (r.food) {
                detail += 'เสบียงอาหาร '
              }
              if (r.crews) {
                detail += `, กำลังคน จำนวน ${r.crewsNumber} คน `
              }
              if (r.equipments) {
                detail += ', อุปกรณ์ '
              }
              if (msg.others) {
                detail += 'และระบุเพิ่มเติมว่า ' + msg.others
              }
            } else if (msg.actionType === 'updateSituation') {
              detail += `ได้อัพเดตสถานการณ์ความรุนแรง ใน${msg.ts} อยู่ในระดับ`
              const SEVERITY = {
                low: 'ไฟไม่รุนแรง',
                high: 'เริ่มเข้าสู่ช่วงวิกฤต',
                danger: 'เข้าขั้นวิกฤติ อันตราย'
              }
              detail += SEVERITY[msg.severity]
            } else if (msg.actionType === 'finishCase') {
              detail += `ในทีสุดได้เสร็จสิ้นภารกิจการดับไฟ เมื่อ${msg.ts} `
            }
            actions.push(detail)
          }
        }
      })

      const firstReportUser = this.members.find(m => {
        return m.userId === lastLocationMsg.userId
      })

      let department = ''
      if (firstReportUser) {
        department = firstReportUser.authorityName
      }

      actions.unshift(`${department} รายงานสถานการณ์ไฟป่า ` +
        lastLocationMsg.ts + ' บริเวณไฟไหม้ ' + lastLocationMsg.message)

      return actions.join(' ')
    }
  },
  methods: {
   // getDateTime (ts) {
    //  return moment(ts).format('วันที่ LLL น.')
   // }
  }
}
</script>
