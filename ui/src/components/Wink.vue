<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>

  import L from 'leaflet'

  const props = {
    visible: {
      type: Boolean,
      custom: true,
      default: true
    },
    latLng: {
      type: [Object, Array]
    }
  }

  const iconRadar = L.divIcon({
    className: 'radar-wink-wrapper',
    iconSize: [160, 160],
    iconAnchor: [80, 80],
    html: '<div class="radar-wink"></div>'
  })

  export default {
    props,
    mounted () {
      this.mapObject = L.marker(this.latLng, {
        icon: iconRadar
      })

      this.mapObject.on('click', ev => {
        this.$emit('l-click', ev)
      })

      if (this.$parent._isMounted) {
        this.deferredMountedTo(this.$parent.mapObject)
      }
      console.log('create wink', this.mapObject)
    },
    beforeDestroy () {
      this.setVisible(false)
    },
    methods: {
      deferredMountedTo (parent) {
        this.parent = parent
        if (this.visible) {
          console.log('add wink to parent', parent, this.mapObject)
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
      }
    }
  }
</script>

<style>
  .radar-wink-wrapper {
    pointer-events: none;
    cursor: inherit;
  }

  .radar-wink {
    width: 160px;
    height: 160px;

    background-color:  #e91e63;
    border-radius: 160px;
    opacity: .5;

    animation-duration: 1.8s;
    animation-name: wink;
    animation-iteration-count: infinite;
  }

  @keyframes wink {
    from {
      opacity: .5;
      transform: scale(0.1);
    }

    to {
      opacity: .1;
      transform: scale(1);
    }
  }
</style>
