<template>
  <div class="dashboard">
    <div class="-left">
      <div id="map-container">
        <v-map :zoom="12" :center="[18.7061, 98.9817]">
          <v-tilelayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"></v-tilelayer>
          <v-geo-json  :geojson="cnxGeoJson" :options="geoJsonOptions"></v-geo-json>
          <wms-tilelayer :key="firms.url"
                         :baseurl="firms.url"
                         :format="firms.format"
                         :transparent="true"
                         ids="fires24"
                         :crs="firms.crs">

          </wms-tilelayer>
          <v-circle v-for="room in chatrooms"  :key="room.id" :lat-lng="room.meta.location" :visible="room.visible" :radius="radius(room)"
                    :color="color(room)"
                    v-on:l-click="select(room)"
          ></v-circle>
        </v-map>
      </div>
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
import L from 'leaflet'
import Vue2Leaflet from 'vue2-leaflet'
import ChatRoom from './ChatRoom.vue'
import { default as cnxGeoJson } from '../../assets/cnx-authority'

function onEachFeature (feature, layer) {
  layer.bindPopup('<p>' + feature.properties.name + '</p>')
}

export default {
  name: 'Dashboard',
  components: {
    'v-map': Vue2Leaflet.Map,
    'v-tilelayer': Vue2Leaflet.TileLayer,
    'v-marker': Vue2Leaflet.Marker,
    'v-circle': Vue2Leaflet.LCircle,
    'v-geo-json': Vue2Leaflet.GeoJSON,
    'wms-tilelayer': Vue2Leaflet.WMSTileLayer,
    ChatRoom
  },
  data: function () {
    return {
      chatrooms: [],
      currentRoom: null,
      currentToken: '',
      loading: false,
      cnxGeoJson: cnxGeoJson,
      geoJsonOptions: {
        style: function () {
          return {
            weight: 2,
            color: '#ECEFF1',
            opacity: 1,
            fillColor: '#e4ce7f',
            fillOpacity: 0.4
          }
        },
        onEachFeature
      },
      /**
       * firms -> https://firms.modaps.eosdis.nasa.gov/web-services/#firms-wms
       */
      firms: {
        url: 'https://firms.modaps.eosdis.nasa.gov/wms/c6/',
        format: 'image/png',
        transparent: true,
        layers: [
          {
            'id': 'fires24',
            'name': 'fires24'
          },
          {
            'id': 'fires48',
            'name': 'fires48'
          }
        ],
        'crs': L.CRS.EPSG4326
      }
    }
  },
  created () {
    const ref = this.$firebase.database().ref('rooms')
    ref.on('child_added', snapshot => {
      let item = snapshot.val()
      let id = snapshot.key
      this.chatrooms.push(Object.assign({
        id: id,
        visible: true,
        selected: false
      }, item))
    })
    ref.on('child_changed', snapshot => {
      let item = snapshot.val()
      let key = snapshot.key
      console.log('change', item)
      console.log('key', key)
      let room = this.chatrooms.find(r => r.id === key)
      console.log('found', room)
      if (room) {
        room.done = item.done
        room.assigned = item.assigned
      }
    })
  },
  methods: {
    select (room) {
      console.log(room.id)

      this.loading = true
      if (this.currentRoom) {
        this.currentRoom.selected = false
      }
      this.currentRoom = room
      this.currentRoom.selected = true

      const authority = this.$store.state.user.authorities[0]
      const payload = {
        roomId: room.id,
        userId: this.$store.state.user.id,
        username: this.$store.state.user.username,
        authorityId: authority.id,
        authorityName: authority.name
      }

      this.$store.dispatch('createToken', payload).then(token => {
        this.currentToken = token
        this.loading = false
        console.log(token)
      })
    },
    radius (room) {
      if (room.meta.severity === 'น้อย') {
        return 300
      } else if (room.meta.severity === 'ปานกลาง') {
        return 750
      }
      return 1000
    },
    color (room) {
      if (room.done) {
        return '#3c7113'
      }
      if (room.assigned) {
        return '#00b3e3'
      }
      return '#ff005a'
    }
  }

}
</script>

<style scoped lang="less">
#map-container {
  height: 100%;
}
.dashboard {
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

@import "../../../node_modules/leaflet/dist/leaflet.css";
</style>
