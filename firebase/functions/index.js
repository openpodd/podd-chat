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
  const tokenMapRef = db.ref('tokenMap').child(roomId + ":" + req.body.userId + ":" + username)
  // find exising token
  return tokenMapRef.once('value').then(tokensnapshot => {
    if (tokensnapshot.exists()) {
      res.send(tokensnapshot.val()).status(200)
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
      // add members to rooms
      const newMemberRef = db.ref('rooms').child(roomId).child('members').child(userId)
      return newMemberRef.set({
        joined: false,
        answered: false,
        token: ref.key,
        authorityId: authorityId,
        authorityName: authorityName,
        username: username
      })
    }).then(() => {
      return tokenMapRef.set(ref.key)
    }).then(() => {
      res.send(ref.key).status(200)
    })
  }).catch(err => {
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

exports.updateRoomStatus = functions.database.ref('/messages/{roomId}/{messageId}/actionType')
  .onWrite(event => {
    const actionType = event.data.val()
    const baseRef = event.data.ref.parent.parent.parent.parent;
    if (actionType === 'commitAreaOperation') {
      baseRef.child('rooms').child(event.params.roomId).child('assigned').set(true)
    } else if (actionType === 'finishCase') {
      baseRef.child('rooms').child(event.params.roomId).child('done').set(true)
    }
  })
