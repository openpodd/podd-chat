<template>
  <div class="ecc-dashboard">
    <div class="-left">
      <gmap-map
        ref="map"
        :center="{ lat: 13.736717, lng: 100.523186 }"
        :zoom="12"
        map-type-id="terrain"
        style="width: 100%; height: 100%">
        <gmap-marker v-for="room in chatrooms" :position="room.meta.location" @click="markerClick(room)"></gmap-marker>
      </gmap-map>
    </div>
    <div class="-right">
      <chat-room v-if="currentChatroom" :fixed="false"></chat-room>
      <div class="member-list">

      </div>
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
        this.chatrooms = rooms.filter(item => item.meta)
        setTimeout(() => {
          window.requestAnimationFrame(() => {
            let bounds = new window.google.maps.LatLngBounds()
            for (let room of this.chatrooms) {
              bounds.extend(room.meta.location)
            }
            this.$refs.map.fitBounds(bounds)
          })
        }, 100)
      })
  },
  methods: {
    markerClick (room) {
      this.currentChatroom = null

      const payload = {
        roomId: room.id,
        userId: 340,
        username: 'noomz'
      }
      this.$store.dispatch('createToken', payload).then(token => {
        console.log('-> token', token)
        this.$store.dispatch('setToken', token).then(() => {
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
  display: flex;
  flex-direction: column;
}
</style>
