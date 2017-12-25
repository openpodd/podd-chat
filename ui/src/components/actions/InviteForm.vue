<template>
  <div>
    <div class="wrapper">
      <div class="-left">
        <div class="tab">
          <button class="tablinks" v-bind:class="{ active: activeTabIdx===0 }" @click="selectTab(0)">ผู้ใช้ระบบ PODD</button>
          <button class="tablinks" v-bind:class="{ active: activeTabIdx===1 }" @click="selectTab(1)">ผู้ใช้ภายนอก</button>
        </div>

        <div class="wrapper">

        </div>
        <div class="tabcontent" v-show="activeTabIdx===0">
          <div class="-search">
            <form @submit.prevent="search(query)">
              <strong>ค้นหา</strong>
              <input type="text" v-model="query"> <button @click="search(query)">Search</button>
            </form>

            <div class="search-results" v-if="results.length">
              <div class="item" v-for="item in results">
                <span class="-name">{{ item.firstName }} {{ item.lastName }}</span> <span class="text-muted">({{ item.username }})</span>
                <button class="btn pull-right" @click="addPoddUser(item)">เพิ่ม</button>
              </div>
            </div>
            <div v-else>
              ไม่พบผลการค้นหา
            </div>
          </div>
        </div>

        <div class="tabcontent" v-show="activeTabIdx===1">
          <div class="-search">
            <form>
              <div>
                <strong>เบอร์โทรศัพท์ :</strong>
                <input type="text" v-model="telno">
              </div>
              <div>
                <strong>ชื่อ :</strong>
                <input type="text" v-model="name">
              </div>
              <div>
                <strong>หน่วยงาน :</strong>
                <input type="text" v-model="authorityName">
              </div>
              <button class="btn" @click="addAnonymous(telno, name, authorityName)">เพิ่ม</button>
            </form>
          </div>
        </div>
      </div>

      <div class="-right">
        <div class="-selected">
          <strong>ที่เลือกไว้</strong>
          <div v-if="selected.length">
            <div class="item" v-for="item in selected">
              <span v-show="item.type === 'podd'" class="-name">{{ item.firstName }} {{ item.lastName }} <span class="text-muted">({{ item.username }})</span></span>
              <span v-show="item.type === 'anonymous'" class="-name">
                {{ item.name }}
                {{ item.authorityName }}
                <span class="text-muted">({{ item.telno }})</span>
              </span>
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
      telno: '',
      name: '',
      results: [],
      searching: false,
      selected: [],
      activeTabIdx: 0,
      runningId: 0
    }
  },
  methods: {
    selectTab (idx) {
      this.activeTabIdx = idx
    },
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
    addAnonymous (telno, name, authorityName) {
      this.selected.push({
        id: this.runningId++,
        authorityName: authorityName,
        telno: telno,
        name: name,
        type: 'anonymous'
      })
    },
    addPoddUser (item) {
      if (!this.selected.find(it => it.id === item.id)) {
        item.type = 'podd'
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
        inviteList: this.selected.map(item => {
          if (item.type === 'podd') {
            return {
              type: 'podd',
              id: item.id
            }
          } else {
            return {
              type: 'anonymous',
              telno: item.telno,
              name: item.name,
              authorityName: item.authorityName
            }
          }
        })
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
    cursor: pointer;
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

.tab {
  overflow: hidden;
  border: 1px solid #ccc;
  background-color: #f1f1f1;
}

.tab .tablinks {
  background-color: inherit;
  float: left;
  border: none;
  outline: none;
  cursor: pointer;
  padding: 14px 16px;
  transition: 0.3s;
}

.tab .tablinks:hover {
  background-color: #ddd;
}

/* Create an active/current tablink class */
.tab .tablinks.active {
  background-color: #ccc;
}

.tabcontent {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-top: none;
}
</style>
