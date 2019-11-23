<template>
  <div style="display: none;">
    <slot v-if="ready"></slot>
  </div>
</template>

<script>
import L from 'leaflet'
import 'leaflet.gridlayer.googlemutant'

const props = {
  options: {
    type: Object,
    default () { return {} }
  },
  apikey: {
    type: String,
    default () { return '' }
  },
  lang: {
    type: String,
    default: null
  },
  region: {
    type: String,
    default: null
  },
  name: {
    type: String,
    default: ''
  },
  layerType: {
    type: String,
    default: 'base'
  },
  visible: {
    type: Boolean,
    default: true
  }
}

function capitalizeFirstLetter (string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const propsBinder = (vueElement, leafletElement, props, options) => {
  const keys = Object.keys(props)
  for (var i = 0; i < keys.length; i++) {
    const key = keys[i]
    const setMethodName = 'set' + capitalizeFirstLetter(key)
    const deepValue = (props[key].type === Object) ||
      (props[key].type === Array) ||
      (Array.isArray(props[key].type))
    if (props[key].custom) {
      vueElement.$watch(key, (newVal, oldVal) => {
        vueElement[setMethodName](newVal, oldVal)
      }, {
        deep: deepValue
      })
    } else if (setMethodName === 'setOptions') {
      vueElement.$watch(key, (newVal, oldVal) => {
        L.setOptions(leafletElement, newVal)
      }, {
        deep: deepValue
      })
    } else {
      vueElement.$watch(key, (newVal, oldVal) => {
        leafletElement[setMethodName](newVal)
      }, {
        deep: deepValue
      })
    }
  }
}

export default {
  props,
  data () {
    return {
      ready: false
    }
  },
  mounted () {
    this.mapObject = L.gridLayer.googleMutant(this.options)
    propsBinder(this, this.mapObject, props)
    L.DomEvent.on(this.mapObject, this.$listeners)
    this.ready = true
  },
  beforeDestroy () {
    this.setVisible(false)
  },
  methods: {
    deferredMountedTo (parent) {
      this.parent = parent
      if (this.visible) {
        this.mapObject.addTo(parent)
      }
    },
    setVisible (newVal, oldVal) {
      if (newVal === oldVal) return
      if (this.mapObject) {
        if (newVal) {
          this.mapObject.addTo(this.parent)
        } else {
          this.parent.removeLayer(this.mapObject)
        }
      }
    },
    addLayer (layer, alreadyAdded) {
      if (!alreadyAdded) {
        this.mapObject.addLayer(layer.mapObject)
      }
    },
    removeLayer (layer, alreadyRemoved) {
      if (!alreadyRemoved) {
        this.mapObject.removeLayer(layer.mapObject)
      }
    }
  }
}
</script>
