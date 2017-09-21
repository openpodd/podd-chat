/**
 * Created by pphetra on 6/23/2017 AD.
 */
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
  },
  strict: debug,
  mutations: {
  },
  actions: {
    createToken: ({commit}, payload) => {
      return new Promise((resolve, reject) => {
        const roomId = payload.roomId.toString()
        const userId = parseInt(payload.userId, 10) || 0
        const username = payload.username

        const db = Vue.$firebase.database()
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
    }
  }
})
