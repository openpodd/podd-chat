<template>
  <div class="post">
    <form class="chat-form" @submit.prevent="post()">
      <button class="chat-form__action" @click.prevent="showActions()">
        ↑
      </button>
      <input type="text" class="chat-form__input" v-model="message" @focus="focus()" @click="focus()"></input>
      <button class="chat-form__submit" type="submit" :disabled="isEmpty()">ส่ง</button>
    </form>
    <div class="action-modal" v-if="actionModalVisible">
      <div class="-backdrop" @click="hideActions()"></div>
      <ul class="actions-list">
        <li class="action-item">
          อัพโหลดรูป
          <input type="file" @change="uploadImage">
        </li>
        <li class="action-item" @click="showAction('commitAreaOperation')">ลงพื้นที่</li>
        <li class="action-item" @click="showAction('requestSupport')">ขอการสนับสนุน</li>
        <li class="action-item" @click="showAction('invite')">เชิญบุคคลอื่นเข้าร่วม</li>
        <li class="action-item" @click="showAction('finishCase')">ดับไฟเสร็จสิ้น</li>
      </ul>
    </div>

    <modal v-if="modalVisibility.commitAreaOperation" title="ยืนยันการลงพื้นที่" @modalClose="hideAction('commitAreaOperation')">
      <commit-area-operation-form @actionDone="onActionDone()" @actionCancel="hideAction('commitAreaOperation')"></commit-area-operation-form>
    </modal>

    <modal v-if="modalVisibility.requestSupport" title="ขอการสนับสนุน" @modalClose="hideAction('requestSupport')">
      <request-support-form @actionDone="onActionDone()" @actionCancel="hideAction('requestSupport')"></request-support-form>
    </modal>

    <modal v-if="modalVisibility.invite" title="เชิญบุคคลอื่น" @modalClose="hideAction('invite')">
      Feature ในอนาคต
    </modal>

    <modal v-if="modalVisibility.finishCase" title="ดับไฟเสร็จสิ้น" @modalClose="hideAction('finishCase')">
      <finish-case-form @actionDone="onActionDone()" @actionCancel="hideAction('finishCase')"></finish-case-form>
    </modal>
  </div>
</template>

<script>
import Modal from './Modal.vue'
import CommitAreaOperationForm from './actions/CommitAreaOperationForm.vue'
import RequestSupportForm from './actions/RequestSupportForm.vue'
import FinishCaseForm from './actions/FinishCaseForm.vue'

export default {
  name: 'post',
  components: {
    FinishCaseForm,
    RequestSupportForm,
    CommitAreaOperationForm,
    Modal
  },
  data () {
    return {
      message: '',
      actionModalVisible: false,
      modalVisibility: {
        commitAreaOperation: false,
        requestSupport: false,
        invite: false,
        finishCase: false
      }
    }
  },
  methods: {
    scrollBottom () {
      let body = document.getElementsByTagName('body')[0]
      window.scrollTo(0, body.scrollHeight)
    },
    async post () {
      await this.$store.dispatch('postMessage', { message: this.message })
      this.message = ''
      this.scrollBottom()
    },
    isEmpty () {
      return this.message.trim().length === 0
    },
    focus () {
      setTimeout(() => {
        this.scrollBottom()
      }, 500)
    },
    toggleActions () {
      this.actionModalVisible = !this.actionModalVisible
    },
    showActions () {
      this.toggleActions()
    },
    hideActions () {
      this.actionModalVisible = false
    },
    showAction (type) {
      this.modalVisibility[type] = true
    },
    hideAction (type) {
      this.modalVisibility[type] = false
    },
    onActionDone () {
      this.hideAction('commitAreaOperation')
      this.hideAction('requestSupport')
      this.hideAction('invite')
      this.hideAction('finishCase')
      this.hideActions()
    },
    uploadImage ($event) {
      if ($event.target.files.length > 0) {
        this.$store.dispatch('uploadImage', $event.target.files[0])
          .then(resp => {
            this.$store.dispatch('postMessage', {
              image_url: resp.metadata.downloadURLs[0]
            })
          })
          .catch(err => {
            console.log(err)
            this.$modal.show({
              title: 'ผิดพลาด',
              text: 'กรุณาลองใหม่อีกครั้ง'
            })
          })
      }
    }
  }
}
</script>

<style lang="less">
.post {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  padding: .75em;
  background-color: #fff;
  box-shadow: -1px 0 5px #ccc;
}

.chat-form {
  width: 100%;
  height: 100%;

  &__input {
    float: left;
    width: 70%;
    height: 100%;
    padding: 4px;
    border: none;
    font-size: 1em;
    // border-radius: .25rem;
    box-shadow: 0 0 2px #dcdcdc inset;
    background-color: #eee;
  }
  &__submit, &__action {
    width: 15%;
    height: 100%;
    border: none;
    color: #fff;
    background-color: #11ad51;
    font-size: 16px;

    &[disabled] {
      opacity: .7;
    }
  }

  &__action {
    background-color: #ffa100;
    float: left;
  }
}

.action-modal {
  position: absolute;
  bottom: 52px;

  font-size: 1.34em;
  background-color: #fff;
  box-shadow: 0 0 2px #dcdcdc inset;

  .-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
  }

  .actions-list {
    padding: 0;
    margin: 0;

    .action-item {
      padding: 8px 12px;
      list-style: none;
      cursor: pointer;
      border-bottom: 1px solid #eee;
      background-color: #fff;
      position: relative;

      &:hover {
        background-color: #ffa100;
        color: #fff;
      }

      input[type=file] {
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        opacity: .0001;
        cursor: pointer;
      }
    }
  }
}
</style>
