
<template>
  <div class="room-members">
    <table class="list">
      <tr>
        <th>ชื่อ</th>
        <th>หน่วยงาน</th>
        <th>เข้าร่วม</th>
        <th>ตอบกลับ</th>
      </tr>
      <tr v-for="member in members" :key="member.id">
        <td>{{member.username}}</td>
        <td>{{member.authorityName}}</td>
        <td width="80"><i v-if="member.joined" class="material-icons md-24">check</i></td>
        <td width="80"><i v-if="member.answered" class="material-icons md-24">check</i></td>
      </tr>
    </table>
  </div>
</template>

<script>
export default {
  props: {
    tokenInfo: {
      type: Object,
      required: true
    }
  },
  created () {
    this.$store.dispatch('fetchRoomMembers', this.tokenInfo.roomId)
  },
  computed: {
    members () {
      return this.$store.state.roomMembers
    }
  }
}
</script>

<style lang="less" scoped>
.room-members {

  .list {
    width: 100%;

    th {
      background-color: #FDFBC3;
      font-weight: 400;
      text-align: left;
      padding: 8px;
    }
    td {
      border-bottom: 1px solid #cccccc;
    }
  }
}
</style>
