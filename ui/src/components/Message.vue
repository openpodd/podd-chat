<template>
  <div class="message">
    <avatar v-bind:message="message"></avatar>

    <div class="message__content" :class="{'message__content_sender': isMine }">
      <a class="message__author">{{message.username}}</a>
      <div class="message__metadata">
        <span class="message__date">เมื่อ {{ message.ts | moment("from") }}</span>
      </div>
      <div class="message__text" v-html="parsedMessage">
      </div>
      <div class="message__image">
        <img :src="message.image_url">
      </div>
      <div class="message__map" v-if="containsLocation">
        <gmap-map
          :center="messageLocation"
          :zoom="12"
          map-type-id="terrain"
          style="width: 100%; height: 300px">
          <gmap-marker :position="messageLocation"></gmap-marker>
        </gmap-map>
      </div>
      <div class="message__action" v-if="isAction">
        <div v-if="message.actionType == 'commitAreaOperation'">
          <span class="-label">Action</span> ยืนยันการลงพื้นที่ของหน่วยงาน <span class="variable">{{ message.department }}</span> จำนวน <strong>{{ message.crewsNumber }}</strong> คน
          <img class="sticker" src="../assets/amita_ok.png">
        </div>

        <div v-if="message.actionType == 'requestSupport'">
          <div><span class="-label">Action</span> ขอความช่วยเหลือ</div>
          <ul class="-resources-list">
            <li v-if="message.resources.food">เสบียงอาหาร</li>
            <li v-if="message.resources.crews">กำลังคน จำนวน <strong>{{ message.resources.crewsNumber }}</strong> คน</li>
            <li v-if="message.resources.equipments">อุปกรณ์</li>
          </ul>
          <div class="-others" v-if="message.others">
            <strong>เพิ่มเติม:</strong> {{ message.others }}
          </div>
          <img class="sticker" src="../assets/amita_cry.png">
        </div>

        <div v-if="message.actionType == 'finishCase'">
          <div><span class="-label">Action</span> ดับไฟเสร็จสิ้น</div>
          <img class="sticker" src="../assets/amita_yeah.png">
        </div>

        <div v-if="message.actionType == 'updateSituation'">
          <div><span class="-label">Action</span> อัพเดตสถานการณ์</div>
          ความรุนแรง: <span class="severity" :class="`severity-${message.severity}`">{{ getSeverityLabel(message.severity) }}</span>
        </div>

        <div v-if="message.actionType == 'invite'">
          <div><span class="-label">Action</span> ได้เชิญบุคคลเข้าร่วมแชท</div>
          <ul class="-invited-list">
            <li v-for="item in message.invitedList">
              <span v-if="item.type==='podd'">
                {{ item.username }} (<span class="text-muted">{{ item.firstName }} {{ item.lastName}}</span>)
              </span>
              <span v-if="item.type==='anonymous'">
                {{ item.name }} {{ item.authorityName}} (<span class="text-muted">{{ item.telno }}</span>)
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Avatar from './Avatar'

const SEVERITY_TEXTS = {
  low: 'ไฟไม่รุนแรง',
  high: 'เริ่มเข้าสู่ช่วงวิกฤต',
  danger: 'เข้าขั้นวิกฤติ อันตราย'
}

export default {
  name: 'message',
  props: ['message'],
  components: {
    Avatar
  },
  methods: {
    getSeverityLabel (key) {
      return SEVERITY_TEXTS[key]
    }
  },
  computed: {
    isMine () {
      if (this.$store.state.user != null && this.message != null) {
        return this.message.username === this.$store.state.user.username || this.message.userId === this.$store.state.user.id
      }
      return false
    },
    parsedMessage () {
      return this.message.message.replace(/(https?:\/\/www.cmonehealth.org\/\b([-a-zA-Z0-9@:%_+.~#?&//=]*))/g, '<a target="_blank" href="$1">$1</a>')
    },
    isAction () {
      return this.message.type === 'action'
    },
    containsLocation () {
      return this.message.message.match(/พิกัด\s+[0-9.]+,\s+[0-9.]+/)
    },
    messageLocation () {
      let latLng = this.message.message.match(/พิกัด\s+([0-9.]+),\s+([0-9.]+)/)
      return {
        lat: parseFloat(latLng[1]),
        lng: parseFloat(latLng[2])
      }
    }
  }
}
</script>

<style lang="less">
  .message {
    position: relative;
    background: 0 0;
    margin: .5em 0 0;
    padding: .5em 0 0;
    border: none;
    border-top: none;
    line-height: 1.2;

    &__avatar {
      display: block;
      width: 2.5em;
      height: auto;
      float: left;
      margin: .2em 0 0;
    }
    &__avatar_image {
      display: block;
      margin: 0 auto;
      width: 100%;
      height: 100%;
      border-radius: .25rem;
    }
    &__avatar_sender {
      float: right;
    }
    &__content {
      margin-left: 3.5em;
      padding: .5em;
      background-color: #fff;
      border-radius: .25rem;
      box-shadow: 0 1px 2px #acacac;
    }
    &__content_sender {
      margin: 0 3.5em 0 0;
      background-color: #fdfbc3;
    }
    &__author {
      font-size: 1em;
      color: rgba(0,0,0,.87);
      font-weight: 500;
    }
    &__metadata {
      display: inline-block;
      margin-left: .3em;
      color: rgba(0,0,0,.4);
      font-size: .775em;
    }
    &__date {
      display: inline-block;
      margin: 0 .5em 0 0;
    }
    &__text {
      margin: .5em 0 0;
      font-size: 1em;
      word-wrap: break-word;
      color: rgba(0,0,0,.87);
      line-height: 1.3;
      user-select: text;

      img {
        margin: 8px 0;
        width: 100%;
      }
    }

    &__action {
      .-label {
        font-style: italic;
        color: #fff;
        padding: 0 6px;
        border-radius: 4px;
        background-color: #ffa100;
      }
    }
  }

  .severity {
    font-style: italic;

    &-low {
      border-bottom: 2px solid #d6d806;
    }

    &-high {
      border-bottom: 2px solid #ff9d00;
    }

    &-danger {
      border-bottom: 2px solid #d80580;
    }
  }

  .message__image {
    img {
      width: 100%;
    }
  }

  .variable {
    /*font-size: 0.87em;*/
    font-style: italic;
    /*background-color: #eee;*/
    border-bottom: 1px solid #ccc;
    padding: 0 6px;
  }

  img.sticker {
    max-width: 100%;
  }
</style>
