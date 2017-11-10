const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase)

function getSecretKey (req) {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Secret')) {
    return ''
  }

  return req.headers.authorization.split('Secret ')[1]
}

exports.createToken = functions.https.onRequest((req, res) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST').status(200)
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const now = new Date().getTime()
  const roomId = req.body.roomId.toString()
  const username = req.body.username
  const userId = parseInt(req.body.userId, 10)
  const authorityId = parseInt(req.body.authorityId, 10) || 0
  const authorityName = req.body.authorityName || ''
  const secretKey = getSecretKey(req)
  if (secretKey !== functions.config().podd.secretkey) {
    res.status(401).send('Unauthorized')
    return
  }

  const db = admin.database()
  // find exising token
  db.ref('tokens').orderByChild('ts').equalTo(roomId, 'roomId').once('value')
    .then(snapshot =>  {
      let token = ''
      snapshot.forEach(child => {
        let item = child.val()
        if (item.username === username) {
          token = child.key
        }
      })

      if (token !== '') {
        res.send(token).status(200)
        return
      }

      const ref = db.ref('tokens').push()
      return ref.set({
        roomId: roomId,
        userId: userId,
        username: username,
        authorityId: authorityId,
        authorityName: authorityName,
        ts: now
      }).then(() => {
        res.send(ref.key).status(200)
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
      res.send(err).status(500)
    })
})

exports.postMessage = functions.https.onRequest((req, res) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST').status(200)
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const now = new Date().getTime()
  const roomId = req.body.roomId.toString()
  const message = req.body.message
  const username = req.body.username
  const userId = parseInt(req.body.userId, 10)
  const imageUrl = req.body.imageUrl
  const meta = req.body.meta
  const secretKey = getSecretKey(req)
  if (secretKey !== functions.config().podd.secretkey) {
    res.status(401).send('Unauthorized')
    return
  }

  const db = admin.database()
  const ref = db.ref('messages').child(roomId).push()
  const msgObject = {
    message: message,
    ts: now,
    username: username,
    userId: userId,
    meta: meta
  }
  if (imageUrl) {
    msgObject.imageUrl = imageUrl
  }

  return ref.set(msgObject).then(() => {
    res.send('{"success": true}').status(200)
  })
})

exports.createRoom = functions.https.onRequest((req, res) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST').status(200)
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const now = new Date().getTime()
  const roomId = req.body.roomId.toString()
  const roomName = req.body.roomName
  const welcomeMessage = req.body.welcomeMessage
  const userId = parseInt(req.body.userId, 10)
  const username = req.body.username
  const meta = req.body.meta || {}
  const secretKey = getSecretKey(req)
  if (secretKey !== functions.config().podd.secretkey) {
    res.status(401).send('Unauthorized')
    return
  }

  const db = admin.database()
  return db.ref('rooms').child(roomId).set({
    description: roomName,
    meta: meta
  }).then(() => {
    const ref = db.ref('messages').child(roomId).push()
    return ref.set({
      userId: userId,
      message: welcomeMessage,
      username: username,
      ts: now
    })
  }).then(() => {
    res.send('ok').status(200)
  })
})
