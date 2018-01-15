<template>
  <div class="login-page">
    <form class="form form--box border" @submit.prevent="login()" novalidate v-if="!autoLogin">
      <h2 class="form__title">เข้าสู่ระบบ</h2>
      <div class="form__item">
        <label class="form__label" for="username">บัญชีผู้ใช้</label>
        <input class="form__input" type="username" id="username"  v-model="username" :class="{ 'form__input--error': $v.isError('username') }" />
        <div class="alert --error" v-show="$v.$errors.username.empty">กรุณากรอกบัญชีผู้ใช้</div>
      </div>
      <div class="form__item">
        <label class="form__label" for="password">รหัสผ่าน</label>
        <input class="form__input" type="password" id="password" v-model="password" :class="{ 'form__input--error': $v.isError('password') }" />
        <div class="alert --error" v-show="$v.$errors.password.empty">กรุณากรอกรหัสผ่าน</div>
      </div>

      <button class="btn btn-solid btn-full" :disabled="submitting">เข้าสู่ระบบ</button>
    </form>
    <p v-if="autoLogin">กำลังดำเนินการ Auto Login PODD กรุณารอสักครู่</p>
  </div>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'LoginPage',
  data () {
    return {
      submitting: false,
      username: '',
      password: '',
      fbVisible: false,
      autoLogin: false,
      $v: {}
    }
  },
  created () {
    if (this.$store.state.token) {
      this.$router.push('/dashboard')
    }

    this.$v = this.$validator.init(this, {
      username: {
        checkEmpty: true
      },
      password: {
        checkEmpty: true
      }
    })
  },
  mounted () {
    const poddToken = Vue.getCookie('token')
    if (poddToken !== undefined && poddToken !== '') {
      this.autoLogin = true
      this.axios.post(`${Vue.config.apiUrl}/firebase/token/`, {}, {
        headers: { Authorization: `Token ${poddToken}` }
      }).then(resp => {
        return resp.data
      }).then(user => {
        return this.axios.get(`${Vue.config.apiUrl}/authorities/`, {
          headers: { Authorization: `Token ${poddToken}` },
          query: { page_size: 10 }
        }).then(resp => {
          user.authorities = resp.data
          user.token = poddToken
          this.$store.dispatch('setUser', user)
          this.$router.push(`${this.next}`)
        })
      }).catch(err => {
        console.log(err)
        this.$modal.show({
          title: 'ผิดพลาด',
          text: 'เกิดความผิดพลาดในการเชื่อมต่อกับ Server'
        })
      })
    }
  },
  computed: {
    next () {
      return this.$route.query.next || '/dashboard'
    }
  },
  methods: {
    doLogin (payload) {
      this.axios.post(`${Vue.config.apiUrl}/api-token-auth/`, payload, { autoLogout: false })
        .then(resp => {
          this.submitting = false
          this.$modal.hide()

          let user = resp.data

          // get authorities.
          const opts = {
            query: { page_size: 10 },
            headers: { Authorization: `Token ${user.token}` }
          }
          this.axios.get(`${Vue.config.apiUrl}/authorities/`, opts)
            .then(resp => {
              user.authorities = resp.data
              this.$store.dispatch('setUser', user)
              this.$router.push(`${this.next}`)
            })
            .catch(err => {
              console.log(err)
              this.$modal.show({
                title: 'ผิดพลาด',
                text: 'กรุณาลองใหม่อีกครั้ง'
              })
            })
        })
        .catch(err => {
          console.log(err)
          this.submitting = false

          this.$modal.show({
            title: 'ผิดพลาด',
            text: 'กรุณาตรวจสอบบัญชีผู้ใช้และรหัสผ่านใหม่อีกครั้ง'
          })
        })
    },
    login () {
      if (this.submitting) {
        return
      }

      if (!this.$v.validate()) {
        this.$forceUpdate()
        return
      }

      this.$forceUpdate()
      this.submitting = true

      const payload = {
        username: this.username,
        password: this.password
      }

      this.$modal.show({
        title: 'โปรดรอสักครู่',
        text: 'กำลังเข้าสู่ระบบ ...',
        okButton: false
      })

      this.doLogin(payload)
    }
  }
}
</script>

<style lang="less" scoped>
.form {
  width: 50%;
  margin: 0 auto;
  text-align: center;

  font-size: 1.4em;
  background-color: #fff;
  padding: 1em 1em 3em 1em;
}

.form__item {
  text-align: left;

  .form__label {
    width: 40%;
    display: inline-block;
    text-align: right;
  }

  .form__input {
    width: 30%;
    height: 30px;
  }
}
.btn {
  font-size: 1em;
  margin-top: 1em;
}

.alert {
  margin-left: calc(~"40% + 8px");
  padding: 1px 8px;
  width: 30%;
}
</style>
