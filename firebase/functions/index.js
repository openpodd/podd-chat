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
  const roomId = req.query.roomId
  const username = req.query.username
  const userId = req.query.userId
  const secretKey = getSecretKey(req)
  if (secretKey !== functions.config().podd.secretkey) {
    res.status(401).send('Unauthorized')
    return
  }

  const db = admin.database()
  const ref = db.ref('tokens').push()
  return ref.set({
    roomId: roomId,
    userId: userId,
    username: username,
    ts: now
  }).then(() => {
    res.send(ref.key).status(200)
  })
})
