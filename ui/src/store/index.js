/**
 * Created by pphetra on 6/23/2017 AD.
 */
import Vue from 'vue'
import Vuex from 'vuex'
import {getQueryParameter} from './util.js'
import config from './config.js'

const firebase = require('firebase')

firebase.initializeApp(config.firebase)
const db = firebase.database()
const storage = firebase.storage()

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'
const token = getQueryParameter('token')

export default new Vuex.Store({
  state: {
    token: token,
    username: 'anonymous',
    roomName: '---',
    roomId: '',
    messages: [],
    apiUrl: config.apiUrl
  },
  strict: debug,
  mutations: {
    setUserId: (state, userId) => {
      state.userId = userId
    },
    setUsername: (state, username) => {
      state.username = username
    },
    setRoomName: (state, name) => {
      state.roomName = name
    },
    setRoomId: (state, roomId) => {
      state.roomId = roomId
    },
    addMessage: (state, message) => {
      state.messages.push(message)
    },
    clearMessage: (state) => {
      state.messages = []
    },
    setToken: (state, token) => {
      state.token = token
    }
  },
  actions: {
    setToken: ({commit, state}, token) => {
      commit('setToken', token)
    },
    createToken: ({commit, state}, payload) => {
      return new Promise((resolve, reject) => {
        const roomId = payload.roomId.toString()
        const userId = parseInt(payload.userId, 10) || 0
        const username = payload.username

        db.ref('tokens').orderByChild('roomId').equalTo(roomId).once('value')
          .then(snapshot => {
            let token = ''
            snapshot.forEach(child => {
              let item = child.val()
              if (item.userId === userId || item.username === username) {
                token = child.key
              }
            })

            if (token !== '') {
              resolve(token)
            }

            const ref = db.ref('tokens').push()
            return ref.set({
              roomId: roomId,
              userId: userId,
              username: username,
              authorityId: parseInt(payload.authorityId, 10) || 0,
              authorityName: payload.authorityName || '',
              ts: (new Date()).getTime()
            }).then(() => {
              resolve(ref.key)
              // add members to rooms
              const newMemberRef = db.ref('rooms').child(roomId).child('members').push()
              newMemberRef.set({
                token: ref.key,
                joined: false,
                answered: false
              })
            })
          })
          .catch(err => {
            console.log(err)
            reject(err)
          })
      })
    },
    initChatRoom: ({commit, state}) => {
      commit('clearMessage')
      db.ref('tokens').child(state.token).once('value').then(snapshot => {
        const userInfo = snapshot.val()
        commit('setUsername', userInfo.username)
        commit('setUserId', userInfo.userId)
        return userInfo.roomId
      }).then((roomId) => {
        return db.ref('rooms').child(roomId).child('description').once('value').then(snapshot => {
          commit('setRoomName', snapshot.val())
          commit('setRoomId', roomId)
        }).then(() => {
          return db.ref('messages').child(roomId).on('child_added', msgSnapshot => {
            const msg = msgSnapshot.val()
            commit('addMessage', Object.assign({}, msg, {
              id: msgSnapshot.ref.key,
              ts: new Date(msg.ts)
            }))
          })
        })
      })
    },
    postMessage: ({state}, payload) => {
      const ref = db.ref('messages').child(state.roomId).push()

      const message = Object.assign({
        type: 'message',
        message: '',
        userId: state.userId,
        username: state.username,
        ts: new Date().getTime()
      }, payload)

      return ref.set(message)
    },
    uploadImage ({state}, file) {
      const ext = file.name.replace(/.*(\.[a-zA-Z]+)$/, '$1')
      const filename = 'images/img-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9) + ext
      const ref = storage.ref().child(filename)
      return ref.put(file)
    },
    getChatRooms: () => {
      return new Promise((resolve, reject) => {
        db.ref('rooms').orderByKey().limitToLast(10).once('value')
          .then(async snapshot => {
            let rooms = []
            snapshot.forEach(child => {
              rooms.push(Object.assign({ id: child.key }, child.val()))
            })

            resolve(rooms)
          })
          .catch(err => {
            reject(err)
          })
      })
    }
  }
})
