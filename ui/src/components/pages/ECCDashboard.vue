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
      <chat-room v-if="currentToken" :fixed="false" :token="currentToken"></chat-room>
      <div class="-no-chatroom" v-else>
        <div v-if="!loading">กรุณาเลือกดูห้องสนทนาจากแผนที่</div>
        <div v-else>กำลังโหลด...</div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatRoom from './ChatRoom.vue'

export default {
  name: 'EccDashboard',
  components: {
    ChatRoom
  },
  data () {
    return {
      chatrooms: [],
      currentToken: '',
      loading: false
    }
  },
  created () {
    this.$firebase.database().ref('rooms').on('child_added', snapshot => {
      let item = snapshot.val()
      if (item.meta && item.meta.location) {
        this.chatrooms.push(Object.assign({id: snapshot.key}, item))
      }

      if (this.chatrooms.length === 1) {
        this.fitBounds()
      }
    })
  },
  methods: {
    fitBounds () {
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          let bounds = new window.google.maps.LatLngBounds()
          for (let room of this.chatrooms) {
            bounds.extend(room.meta.location)
          }
          this.$refs.map.fitBounds(bounds)
        })
      }, 200)
    },
    markerClick (room) {
      this.currentToken = ''
      this.loading = true

      const authority = this.$store.state.user.authorities[0]

      const payload = {
        roomId: room.id,
        userId: this.$store.state.user.id,
        username: this.$store.state.user.username,
        authorityId: authority.id,
        authorityName: authority.name
      }

      this.$store.dispatch('createToken', payload).then(token => {
        this.loading = false
        this.currentToken = token
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
.-no-chatroom {
  text-align: center;
  height: 100%;
  padding-top: 1em;
}
</style>
