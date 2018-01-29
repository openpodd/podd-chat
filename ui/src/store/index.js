/* eslint-disable no-useless-escape */
/**
 * Created by pphetra on 6/23/2017 AD.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const VERSION = '1.0'

function setItem (key, payload) {
  window.sessionStorage.setItem(key, JSON.stringify(payload))
}

function getItem (key) {
  const payloadString = window.sessionStorage.getItem(key)

  try {
    return JSON.parse(payloadString)
  } catch (err) {
    console.log(err)
    return null
  }
}

// validate store version.
const currentVersion = getItem('version')
if (!currentVersion || currentVersion < VERSION) {
  window.localStorage.clear()
  setItem('version', VERSION)
}

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    user: {},
    roomMembers: []
  },
  strict: debug,
  mutations: {
    setUser (state, user) {
      state.user = user
      setItem('user', user)
    },
    setRoomMembers (state, members) {
      state.roomMembers = members
    }
  },
  actions: {
    initUser ({commit}) {
      commit('setUser', getItem('user'))
    },
    setUser ({commit}, user) {
      if (user.firebase_token !== undefined) {
        Vue.$firebase.auth().signInWithCustomToken(user.firebase_token).catch(function (error) {
          console.log(error)
        })
      }
      commit('setUser', user)
    },
    createToken: ({commit}, payload) => {
      return new Promise((resolve, reject) => {
        const roomId = payload.roomId.toString()
        const domainId = payload.domainId
        const userId = parseInt(payload.userId, 10) || 0
        const username = payload.username
        const authorityId = parseInt(payload.authorityId, 10) || 0
        const authorityName = payload.authorityName || ''

        const db = Vue.$firebase.database()
        let userKey = (roomId + ':' + userId + ':' + username).replace(/[.\[\]()]/g, '_')
        const tokenMapRef = db.ref(domainId).child('tokenMap').child(userKey)
        tokenMapRef.once('value').then(tokensnapshot => {
          if (tokensnapshot.exists()) {
            return resolve(tokensnapshot.val())
          } else {
            const ref = db.ref('tokens').push()
            return ref.set({
              roomId: roomId,
              domainId: domainId,
              userId: userId,
              username: username,
              authorityId: authorityId,
              authorityName: authorityName,
              ts: (new Date()).getTime()
            }).then(() => {
              // add members to rooms
              const newMemberRef = db.ref(domainId).child('rooms').child(roomId).child('members').child(ref.key)
              return newMemberRef.set({
                joined: false,
                answered: false,
                authorityId,
                authorityName,
                username: username
              })
            }).then(() => {
              return tokenMapRef.set(ref.key)
            }).then(() => {
              return resolve(ref.key)
            })
          }
        }).catch(err => {
          console.log(err)
          reject(err)
        })
      })
    },
    fetchToken: ({state, commit}, token) => {
      const db = Vue.$firebase.database()
      return db.ref('tokens').child(token).once('value').then(snapshot => {
        let info = snapshot.val()
        info.key = token

        if (!state.user || state.user.id === undefined) {
          commit('setUser', {
            id: info.userId,
            authorities: [
              {
                id: info.authorityId,
                name: info.authorityName
              }
            ],
            domainId: info.domainId,
            username: info.username,
            token: '' // api token
          })
        }
        return info
      })
    },
    fetchChatroom: ({commit}, {domainId, roomId}) => {
      const db = Vue.$firebase.database()
      return db.ref(domainId).child('rooms').child(roomId).once('value').then(snapshot => {
        const room = snapshot.val()
        room.id = snapshot.key
        return room
      })
    },
    joinChatroom: ({state}, {domainId, room, token}) => {
      const db = Vue.$firebase.database()
      return db.ref(domainId).child('rooms').child(room.id).child('members').child(token).child('joined').set(true)
    },
    postMessage: ({state}, payload) => {
      const db = Vue.$firebase.database()
      const ref = db.ref(payload.domainId).child('messages').child(payload.roomId).push()

      const message = Object.assign({
        type: 'message',
        message: '',
        ts: new Date().getTime()
      }, payload.message)

      let roomStatus = {
        lastMessage: ref.key
      }
      if (message.actionType === 'commitAreaOperation') {
        roomStatus.assigned = true
      } else if (message.actionType === 'finishCase') {
        roomStatus.done = true
      }

      return ref.set(message).then(() => {
        return db.ref(payload.domainId).child('rooms').child(payload.roomId).child('members').child(payload.token).child('answered').set(true)
      }).then(() => {
        return db.ref(payload.domainId).child('rooms').child(payload.roomId).update(roomStatus)
      })
    },
    uploadImage ({state}, file) {
      const storage = Vue.$firebase.storage()
      const ext = file.name.replace(/.*(\.[a-zA-Z]+)$/, '$1')
      const filename = 'images/img-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9) + ext
      const ref = storage.ref().child(filename)
      return ref.put(file)
    },
    fetchRoomMembers: async ({commit, dispatch}, {roomId, domainId}) => {
      console.log(domainId, roomId)
      const db = Vue.$firebase.database()
      const roomMembers = []

      const snapshot = await db.ref(domainId).child('rooms').child(roomId).child('members').once('value')
      snapshot.forEach(member => {
        let id = member.key
        const val = member.val()

        const result = {
          id: id,
          username: val.username,
          authorityName: val.authorityName,
          answered: val.answered,
          joined: val.joined
        }
        roomMembers.push(result)
      })
      commit('setRoomMembers', roomMembers)
    }
  }
})
