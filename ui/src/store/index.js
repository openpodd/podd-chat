/**
 * Created by pphetra on 6/23/2017 AD.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const VERSION = '1.0'

function setItem (key, payload) {
  window.localStorage.setItem(key, JSON.stringify(payload))
}

function getItem (key) {
  const payloadString = window.localStorage.getItem(key)

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
    },
    updateRoomMember (state, {id, value}) {
      state.roomMembers.forEach((m, i) => {
        if (m.id === id) {
          Vue.set(state.roomMembers, i, Object.assign({}, m, value))
        }
      })
    }
  },
  actions: {
    initUser ({commit}) {
      commit('setUser', getItem('user'))
    },
    setUser ({commit}, user) {
      commit('setUser', user)
    },
    createToken: ({commit}, payload) => {
      return new Promise((resolve, reject) => {
        const roomId = payload.roomId.toString()
        const userId = parseInt(payload.userId, 10) || 0
        const username = payload.username

        const db = Vue.$firebase.database()
        const tokenMapRef = db.ref('tokenMap').child(roomId + userId)
        tokenMapRef.once('value').then(tokensnapshot => {
          if (tokensnapshot.exists()) {
            return resolve(tokensnapshot.val())
          } else {
            const ref = db.ref('tokens').push()
            return ref.set({
              roomId: roomId,
              userId: userId,
              username: username,
              authorityId: parseInt(payload.authorityId, 10) || 0,
              authorityName: payload.authorityName || '',
              ts: (new Date()).getTime()
            }).then(() => {
              // add members to rooms
              const newMemberRef = db.ref('rooms').child(roomId).child('members').child(ref.key)
              return newMemberRef.set({
                joined: false,
                answered: false
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
    fetchToken: ({commit}, token) => {
      const db = Vue.$firebase.database()
      return db.ref('tokens').child(token).once('value').then(snapshot => {
        return snapshot.val()
      })
    },
    fetchChatroom: ({commit}, roomId) => {
      const db = Vue.$firebase.database()
      return db.ref('rooms').child(roomId).once('value').then(snapshot => {
        return snapshot.val()
      })
    },
    postMessage: ({state}, payload) => {
      const db = Vue.$firebase.database()
      const ref = db.ref('messages').child(payload.roomId).push()

      const message = Object.assign({
        type: 'message',
        message: '',
        ts: new Date().getTime()
      }, payload.message)

      return ref.set(message)
    },
    uploadImage ({state}, file) {
      const storage = Vue.$firebase.storage()
      const ext = file.name.replace(/.*(\.[a-zA-Z]+)$/, '$1')
      const filename = 'images/img-' + Math.random().toString(36).substr(2, 9) + '-' + Math.random().toString(36).substr(2, 9) + ext
      const ref = storage.ref().child(filename)
      return ref.put(file)
    },
    fetchRoomMembers: async ({commit, dispatch}, roomId) => {
      const db = Vue.$firebase.database()
      const roomMembers = []

      const snapshot = await db.ref('rooms').child(roomId).child('members').once('value')
      snapshot.forEach(member => {
        let id = member.key
        const val = member.val()

        // support old version, this is a member key
        if (val.token) {
          id = val.token
        }

        const result = {
          id: id,
          answered: val.answered,
          joined: val.joined
        }
        roomMembers.push(result)
      })
      commit('setRoomMembers', roomMembers)

      roomMembers.forEach(m => {
        dispatch('fetchMember', m.id)
      })
    },
    fetchMember: ({commit}, memberId) => {
      const db = Vue.$firebase.database()
      db.ref('tokens').child(memberId).once('value').then(snapshot => {
        commit('updateRoomMember', {id: snapshot.key, value: snapshot.val()})
      })
    }
  }
})
