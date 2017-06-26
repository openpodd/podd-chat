/**
 * Created by pphetra on 6/23/2017 AD.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import {getQueryParameter} from './util.js'
import config from './config.js'

const firebase = require('firebase')

firebase.initializeApp(config)
const db = firebase.database()

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'
const token = getQueryParameter('token')

export default new Vuex.Store({
  state: {
    token: token,
    username: 'anonymous',
    roomName: '---',
    messages: []
  },
  strict: debug,
  mutations: {
    setUsername: (state, username) => {
      state.username = username
    },
    setRoomName: (state, name) => {
      state.roomName = name
    },
    addMessage: (state, { username, message }) => {
      state.messages.push({
        username: username,
        message: message
      })
    }
  },
  actions: {
    init: ({commit, state}) => {
      db.ref('tokens').child(state.token).once('value').then(snapshot => {
        const userInfo = snapshot.val()
        commit('setUsername', userInfo.username)
        return userInfo.roomId
      }).then((room) => {
        return db.ref('rooms').child(room).child('description').once('value').then(snapshot => {
          commit('setRoomName', snapshot.val())
        }).then(() => {
          return db.ref('messages').child(room).on('child_added', msgSnapshot => {
            const msg = msgSnapshot.val()
            commit('addMessage', {
              username: msg.username,
              message: msg.message
            })
          })
        })
      })
    }
  }
})
