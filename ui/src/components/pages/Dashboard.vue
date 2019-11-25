<template>
  <div class="dashboard">
    <div class="-left">
      <div class="map-control">Layers
        <input id="googleMap" type="checkbox" v-model="googleMapVisible"><label for="googleMap">Google Map</label>
        <select id="googleMapLayer" name="googleMapType" v-model="googleMapLayer">
          <option value="roadmap">roadmap</option>
          <option value="satellite">satellite</option>
          <option value="terrain">terrain</option>
        </select>
        <input id="layerPrediction" type="checkbox" v-model="layerPrediction"><label for="layerPrediction">Prediction</label>
        <input id="layerHotspotall" type="checkbox" v-model="layerHotspotall"><label for="layerHotspotall">Hotspots(All)</label>
        <input id="layerHotspot" type="checkbox" v-model="layerHotspot"><label for="layerHotspot">Hotspots(day)</label>
      </div>
      <div id="map-container">
        <v-map :zoom="9" :center="mapCenter">
          <v-group :visible="!googleMapVisible">
            <v-tilelayer url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"></v-tilelayer>
          </v-group>
          <my-g-map :apikey="googleApiKey" :options="googleMapOptions" :visible="googleMapVisible"></my-g-map>
          <v-geo-json  :geojson="authorityGeoJson" :options="geoJsonOptions"></v-geo-json>

          <!--<wms-tilelayer :key="firms.url"-->
                         <!--:baseurl="firms.url"-->
                         <!--:format="firms.format"-->
                         <!--:transparent="true"-->
                         <!--ids="fires24"-->
                         <!--:crs="firms.crs">-->
          <!--</wms-tilelayer>-->
          <v-group :visible="layerPrediction">
            <wms-tilelayer :key="prediction.url"
                           :baseurl="prediction.url"
                           :format="prediction.format"
                           :transparent="true"
                           :ids="prediction.layer"
                           :crs="prediction.crs">
            </wms-tilelayer>
          </v-group>

          <v-group :visible="layerHotspotall">
            <wms-tilelayer :key="hotspotall.url"
                           :baseurl="hotspotall.url"
                           :format="hotspotall.format"
                           :transparent="true"
                           :ids="hotspotall.layer"
                           :crs="hotspotall.crs">
            </wms-tilelayer>
          </v-group>

          <v-group :visible="layerHotspot">
            <hotspot :key="hotspot.url"
                           :baseurl="hotspot.url"
                           :format="hotspot.format"
                           :transparent="true"
                           :ids="hotspot.layer"
                           :cqlfilter="hotspot.CQL_FILTER"
                           :crs="hotspot.crs">
            </hotspot>
          </v-group>

          <v-group>
            <wink v-for="room in winks" :key="room.id" :lat-lng="room.meta.location" v-on:l-click="select(room)"></wink>
          </v-group>

          <v-circle v-for="room in chatrooms"  :key="room.id" :lat-lng="room.meta.location" :visible="room.visible" :radius="radius(room)"
                    :color="color(room)" :tooltip="room.description"
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
import Wink from '../Wink.vue'
import FireMarker from '../CircleMarker'
import HotspotLayer from '../HotspotLayer'
import GoogleMapLayer from '../GoogleMapLayer'
import config from '../../store/config'
import moment from 'moment'

function onEachFeature (feature, layer) {
  layer.bindPopup('<p>' + feature.properties.name + '</p>')
}

export default {
  name: 'Dashboard',
  components: {
    'v-map': Vue2Leaflet.Map,
    'v-tilelayer': Vue2Leaflet.TileLayer,
    'v-marker': Vue2Leaflet.Marker,
    'v-circle': FireMarker,
    'v-geo-json': Vue2Leaflet.GeoJSON,
    'v-group': Vue2Leaflet.LayerGroup,
    'wms-tilelayer': Vue2Leaflet.WMSTileLayer,
    'hotspot': HotspotLayer,
    'wink': Wink,
    'my-g-map': GoogleMapLayer,
    ChatRoom
  },
  data: function () {
    return {
      chatrooms: [],
      winks: [],
      currentRoom: null,
      currentToken: '',
      loading: false,
      authorityGeoJson: '',
      googleApiKey: config.googleMapApiKey,
      googleMapLayer: 'roadmap',
      googleMapVisible: true,
      geoJsonOptions: {
        style: function () {
          return {
            weight: 2,
            color: '#999',
            opacity: 1,
            fillColor: '#e4ce7f',
            fillOpacity: 0.1
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
        'crs': L.CRS.EPSG4326
      },
      prediction: {
        url: 'http://tile.gistda.or.th/geoserver/forestfire/wms',
        format: 'image/png',
        transparent: true,
        layer: 'forestfire:fire_predict_20170515_20170521_geo',
        'crs': L.CRS.EPSG4326
      },
      hotspotall: {
        url: 'http://tile.gistda.or.th/geoserver/forestfire/wms',
        format: 'image/png',
        transparent: true,
        layer: 'forestfire:hotspot',
        'crs': L.CRS.EPSG4326
      },
      startMonitorChanged: false,
      layerPrediction: false,
      layerHotspotall: false,
      layerHotspot: false
    }
  },
  computed: {
    googleMapOptions () {
      return {
        type: this.$data.googleMapLayer
      }
    },
    mapCenter () {
      if (this.$store.state.user.domain === 7) {
        return [19.90858, 99.8325]
      } else if (this.$store.state.user.domain === 9) {
        return [18.0678091, 98.4355394]
      }
      return [18.7061, 98.9817]
    },
    hotspot () {
      const today = moment()
      const yesterday = moment().subtract(1, 'days')
      return {
        url: 'http://tile.gistda.or.th/geoserver/forestfire/wms',
        format: 'image/png',
        transparent: true,
        layer: 'forestfire:hotspot',
        CQL_FILTER: `datetime between ${yesterday.toISOString()} and ${today.toISOString()}`,
        'crs': L.CRS.EPSG4326
      }
    }

  },
  created () {
    const domainId = this.$store.state.user.domain
    const ref = this.$firebase.database().ref(domainId).child('rooms')
    ref.on('child_added', snapshot => {
      let item = snapshot.val()
      let id = snapshot.key
      let room = Object.assign({
        id: id,
        visible: true,
        selected: false
      }, item)
      this.chatrooms.push(room)
      if (this.startMonitorChanged) {
        this.addWink(room)
      }

      snapshot.ref.on('value', roomsnap => {
        let item = roomsnap.val()
        let key = roomsnap.key
        if (this.startMonitorChanged) {
          let room = this.chatrooms.find(r => r.id === key)
          if (room) {
            room.done = item.done
            room.assigned = item.assigned
            if (!this.currentRoom || this.currentRoom.id !== key) {
              if (room.lastMessage !== item.lastMessage) {
                this.addWink(room)
              }
            }
            room.lastMessage = item.lastMessage
          } else {
            console.log('Room not found [' + key + ']')
          }
        }
      })
    })
    setTimeout(() => {
      this.startMonitorChanged = true
    }, 5000)

    // loadGeojson
    var endpoint = ''
    if (this.$store.state.user.domain === 1) {
      endpoint = 'cnx-authority.json'
    } else if (this.$store.state.user.domain === 7) {
      endpoint = 'cei-authority.json'
    } else if (this.$store.state.user.domain === 9) {
      endpoint = 'lamphun-authority.json'
    }
    this.axios.get(`static/${endpoint}`, {}).then((resp) => {
      console.log(resp.data)
      this.authorityGeoJson = resp.data
    })
  },
  methods: {
    addWink (room) {
      let foundRoom = this.winks.find(r => r.id === room.id)
      if (!foundRoom) {
        this.winks.push(room)
      }
    },
    select (room) {
      this.loading = true
      if (this.currentRoom) {
        this.currentRoom.selected = false
      }
      this.currentRoom = room
      this.currentRoom.selected = true

      const idx = this.winks.findIndex(w => w.id === room.id)
      this.winks.splice(idx, 1)

      const authority = this.$store.state.user.authorities[0]
      const payload = {
        roomId: room.id,
        domainId: this.$store.state.user.domain,
        userId: this.$store.state.user.id,
        username: this.$store.state.user.username,
        authorityId: authority.id,
        authorityName: authority.name
      }

      this.$store.dispatch('createToken', payload).then(token => {
        this.currentToken = token
        this.loading = false
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

<style scoped lang="css">
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
  width: calc(100% - 400px);
}
.-right {
  width: 400px;
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
