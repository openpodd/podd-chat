<template>
  <div class="room">
    <div class="chat-header">
      <p class="chat-header__title">
        {{ chatroom.description }}
      </p>
      <div class="chat-header__user">
        <button @click="viewSituationSummary()"><i class="material-icons md-24">filter_list</i></button>
        <button @click="viewRoomMembers()"><i class="material-icons md-24">face</i></button>
        <img :src="userAvatar">
      </div>
    </div>
    <div class="chat-log" ref="chatLog">
      <div class="messages">
        <message v-bind:message="msg" v-for="msg in messages" :key="msg.id"></message>
      </div>

      <div class="new_message" v-if="notifyNewMessage" @click="scrollBottom()">มีข้อความใหม่ ↓</div>
    </div>

    <modal v-if="roomMembersModal" title="รายชื่อผู้เข้าร่วม" @modalClose="roomMembersModal = false">
      <room-members :tokenInfo="tokenInfo"></room-members>
    </modal>
    <modal v-if="situationSummaryModal" title="สรุปสถานการณ์" @modalClose="situationSummaryModal = false">
      <situation-summary :tokenInfo="tokenInfo" :messages="messages"></situation-summary>
    </modal>
  </div>
</template>

<script>
import Vue from 'vue'
import Message from './Message'
import Modal from './Modal.vue'
import RoomMembers from './RoomMembers.vue'
import SituationSummary from './SituationSummary.vue'

export default {
  name: 'room',
  components: {
    Message,
    Modal,
    RoomMembers,
    SituationSummary
  },
  props: {
    chatroom: {
      type: Object,
      required: true
    },
    tokenInfo: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      inited: false,
      willScrollBottom: false,
      notifyNewMessage: false,
      messages: [],
      roomMembersModal: false,
      situationSummaryModal: false
    }
  },
  created () {
    const db = this.$firebase.database()
    db.ref('messages').child(this.tokenInfo.roomId).once('value').then(snapshot => {
      snapshot.forEach(child => {
        this.addMessage(child)
      })

      window.addEventListener('scroll', this.onScroll, false)
      this.inited = true
      this.willScrollBottom = true

      const last = this.messages[this.messages.length - 1]
      db.ref('messages').child(this.tokenInfo.roomId).orderByKey().startAt(last.id).on('child_added', msgSnapshot => {
        if (msgSnapshot.key !== last.id) {
          this.addMessage(msgSnapshot)
        }
      })
    })
  },
  updated () {
    if (this.willScrollBottom) {
      this.scrollBottom()
    }
  },
  destroyed () {
    window.removeEventListener('scroll', this.onScroll)
  },
  methods: {
    addMessage (snapshot) {
      let msg = snapshot.val()
      msg.id = snapshot.ref.key
      msg.ts = new Date(msg.ts)
      this.messages.push(msg)
    },
    scrollBottom () {
      this.notifyNewMessage = false
      this.$refs.chatLog.scrollTo(0, this.$refs.chatLog.scrollHeight)
      this.willScrollBottom = false
    },
    onScroll (ev) {
      let el = document.scrollingElement
      if (this.notifyNewMessage && (el.scrollTop + window.innerHeight) === el.scrollHeight) {
        this.notifyNewMessage = false
      }
    },
    viewRoomMembers () {
      this.roomMembersModal = true
    },
    viewSituationSummary () {
      this.situationSummaryModal = true
    }
  },
  computed: {
    roomName () {
      return this.chatroom.roomName
    },
    userAvatar: function () {
      let userId = this.tokenInfo.userId
      return (userId && userId !== '0') ? `${Vue.config.apiUrl}/users/${userId}/profile_image/` : `https://api.adorable.io/avatars/35/${this.tokenInfo.username}@podd.png`
    }
  },
  watch: {
    messages (val) {
      if (!this.inited) {
        return
      }
      if (val[val.length - 1].userId !== this.tokenInfo.userId) {
        let el = document.scrollingElement
        if ((el.scrollTop + window.innerHeight) === el.scrollHeight && el.scrollHeight >= window.outerHeight) {
          this.willScrollBottom = true
        } else if (el.scrollHeight >= window.innerHeight) {
          this.notifyNewMessage = true
        }
      }
    }
  }
}
</script>

<style lang="less">
.room {
  height: 100%;
}

.chat-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;

  margin: 0 0 1em;
  color: #fff;
  background-color: #1F2A39;
  border-bottom: 3px solid #19232E;
  z-index: 9;

  &__user {
    display: block;
    text-align: center;
    position: absolute;
    top: 10px;
    right: 10px;

    img {
      width: 2em;
      margin: .2em 0 0;
      border-radius: .25rem;
      vertical-align: top;
    }
  }

  &__title {
    margin: 0;
    padding: 1em 0;
    font-size: 1.2em;
    margin-left: .5em;
    line-height: 1;
    text-align: left;
  }
}


.new_message {
  position: absolute;
  bottom: 70px;
  left: 50%;
  border-radius: 3em;
  box-shadow: 0 1px 2px #acacac;
  padding: 10px 20px;
  background-color: rgba(255, 255, 255, 1);
  opacity: .7;
  transform: translateX(-50%);
  cursor: pointer;
}

.messages {
  margin: .5em;
}
.chat-log {
  padding-top: 60px;
  padding-bottom: 70px;
  overflow: auto;
  height: 100%;
}

</style>
