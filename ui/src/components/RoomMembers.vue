
<template>
  <div class="room-members">
    <table class="list">
      <tr>
        <th>ชื่อ</th>
        <th>หน่วยงาน</th>
        <th>เข้าร่วม</th>
        <th>ตอบกลับ</th>
      </tr>
      <tr v-for="member in valieMembers" :key="member.id">
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
  data () {
    return {
      members: []
    }
  },
  created: function () {
    const db = this.$firebase.database()
    this.memberRef = db.ref('rooms').child(this.tokenInfo.roomId).child('members')

    this.memberListener = this.memberRef.on('child_added', snapshot => {
      let member = snapshot.val()
      console.log('child_added', member)
      this.members.push({
        id: snapshot.key,
        username: member.username,
        authorityName: member.authorityName,
        answered: member.answered,
        joined: member.joined
      })
    })

    this.memberChangedListerner = this.memberRef.on('child_changed', snapshot => {
      let member = snapshot.val()
      let srcMember = this.members.find(m => m.id === snapshot.key)
      Object.assign(srcMember, member)
    })
  },
  destroyed () {
    this.memberRef.off('child_added', this.memberListener)
    this.memberRef.off('child_changed', this.memberChangedListerner)
  },
  computed: {
    valieMembers () {
      return this.members.filter(member => member.username !== undefined)
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
