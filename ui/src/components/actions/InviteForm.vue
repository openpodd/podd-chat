<template>
  <div>
    <div class="wrapper">
      <div class="-left">
        <div class="wrapper">
          <div class="-search">
            <form @submit.prevent="search(query)">
              <strong>ค้นหา</strong>
              <input type="text" v-model="query"> <button @click="search(query)">Search</button>
            </form>

            <div class="search-results" v-if="results.length">
              <div class="item" v-for="item in results">
                <span class="-name">{{ item.firstName }} {{ item.lastName }}</span> <span class="text-muted">({{ item.username }})</span>
                <button class="btn pull-right" @click="add(item)">เพิ่ม</button>
              </div>
            </div>
            <div v-else>
              ไม่พบผลการค้นหา
            </div>
          </div>
        </div>
      </div>
      <div class="-right">
        <div class="-selected">
          <strong>ที่เลือกไว้</strong>
          <div v-if="selected.length">
            <div class="item" v-for="item in selected">
              <span class="-name">{{ item.firstName }} {{ item.lastName }}</span> <span class="text-muted">({{ item.username }})</span>
              <button class="btn pull-right" @click="remove(item)">เอาออก</button>
            </div>
          </div>
          <div v-else>
            ยังไม่ได้เลือก
          </div>
        </div>
      </div>
    </div>

    <div class="actions">
      <button class="btn" @click.prevent="submit()">ยืนยัน</button>
      <button class="btn btn-cancel" @click.prevent="cancel()">ยกเลิก</button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
export default {
  name: 'InviteForm',
  components: {
  },
  props: {
    tokenInfo: {
      type: Object,
      required: true
    },
    subject: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      user: null,
      query: '',
      results: [],
      searching: false,
      selected: []
    }
  },
  methods: {
    search (query) {
      this.searching = true
      let opts = {
        headers: { Authorization: `Token ${this.$store.state.user.token}` }
      }
      this.axios.get(`${Vue.config.apiUrl}/users/search/?query=${query}`, opts)
        .then(resp => {
          this.searching = false
          this.results = resp.data
        })
        .catch(err => {
          console.log(err)
          this.searching = false
        })
    },
    add (item) {
      if (!this.selected.find(it => it.id === item.id)) {
        this.selected.push(item)
      }
    },
    remove (item) {
      this.selected = this.selected.filter(it => it !== item)
    },
    async submit () {
      if (this.selected.length === 0) {
        this.$modal.show({
          title: 'กรุณาเพิ่มบุคคลที่ต้องการเชิญ'
        })
        return
      }

      this.$modal.show({
        title: 'กำลังทำงาน...',
        text: 'กรุณารอสักครู่'
      })

      let invitePayload = {
        subject: this.subject,
        reportId: this.tokenInfo.roomId,
        userIds: this.selected.map(item => item.id)
      }
      let opts = {
        headers: { Authorization: `Token ${this.$store.state.user.token}` }
      }
      this.axios.post(`${Vue.config.apiUrl}/users/chatroom-invites/`, invitePayload, opts)
        .then(async resp => {
          this.$modal.hide()
          let payload = {
            roomId: this.tokenInfo.roomId.toString(),
            message: {
              type: 'action',
              actionType: 'invite',
              invitedList: this.selected,
              userId: this.tokenInfo.userId,
              username: this.tokenInfo.username
            }
          }
          await this.$store.dispatch('postMessage', payload)
          this.$emit('actionDone')
        })
        .catch(err => {
          console.log(err)
          this.$modal.show({
            title: 'ผิดพลาด',
            text: 'กรุณาลองอีกครั้่ง'
          })
        })
    },
    cancel () {
      this.$emit('actionCancel')
    }
  }
}
</script>

<style lang="less" scoped>
.wrapper {
  /*display: flex;*/
  /*flex-direction: row;*/
  width: 100%;
}

input[type=text] {
  border: 1px solid #ccc;
}

.-left, .-right {
  /*width: 50%;*/
  padding: 10px;

  .item {
    clear: both;
    padding: 4px 4px;
    border-bottom: 1px solid #ccc;
  }

  .btn {
    padding: 2px 6px 3px;
  }
}

.search-results {
  border: 1px solid #ccc;
  height: 125px;
  overflow: auto;
}

.-search {
  width: 100%;
}
.-name {
  color: #039be5;
}
</style>
