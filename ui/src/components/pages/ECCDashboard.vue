<template>
  <div class="ecc-dashboard">
    <div class="-left">
      <gmap-map
        :center="{ lat: 13.736717, lng: 100.523186 }"
        :zoom="10"
        map-type-id="terrain"
        style="width: 100%; height: 100%">
        <gmap-marker v-for="room in chatrooms" :position="room.location" @click="markerClick(room)"></gmap-marker>
      </gmap-map>
    </div>
    <div class="-right">
      <chat-room v-if="currentChatroom" :fixed="false"></chat-room>
    </div>
  </div>
</template>

<script>
import ChatRoom from './ChatRoom.vue'

export default {
  components: {ChatRoom},
  name: 'EccDashboard',
  data () {
    return {
      chatrooms: [],
      currentChatroom: null
    }
  },
  created () {
    this.$store.dispatch('getChatRooms')
      .then(rooms => {
        this.chatrooms = rooms
      })
  },
  methods: {
    markerClick (room) {
      this.currentChatroom = null
      this.$store.dispatch('createToken', { roomId: room.id }).then(resp => {
        this.$store.dispatch('setToken', resp.key).then(() => {
          this.currentChatroom = room
        })
      })
    }
  }
}
</script>

<style scoped lang="less">
.ecc-dashboard {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;

  display: flex;
  flex-direction: row;
}

.-left, .-right {
}
.-left {
  width: 70%;
}
.-right {
  width: 30%;
}
</style>
