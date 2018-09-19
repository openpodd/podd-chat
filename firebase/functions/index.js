/* eslint-disable no-useless-escape */
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
  const domainId = req.body.domainId || 1
  const authorityId = parseInt(req.body.authorityId, 10) || 0
  const authorityName = req.body.authorityName || ''
  const secretKey = getSecretKey(req)
  if (secretKey !== functions.config().podd.secretkey) {
    res.status(401).send('Unauthorized')
    return
  }

  const db = admin.database()
  let userKey = (roomId + ':' + req.body.userId + ':' + username).replace(/[.\[\]()]/g, '_')
  const tokenMapRef = db.ref(domainId).child('tokenMap').child(userKey)
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
      let newMemberRef = db.ref(domainId).child('rooms').child(roomId).child('members').child(ref.key)
      return newMemberRef.set({
        joined: false,
        answered: false,
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
  const domainId = req.body.domainId || 1
  const imageUrl = req.body.imageUrl
  const meta = req.body.meta
  const secretKey = getSecretKey(req)
  if (secretKey !== functions.config().podd.secretkey) {
    res.status(401).send('Unauthorized')
    return
  }

  const db = admin.database()
  const ref = db.ref(domainId).child('messages').child(roomId).push()
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
  const domainId = req.body.domainId || 1
  const meta = req.body.meta || {}
  const secretKey = getSecretKey(req)
  if (secretKey !== functions.config().podd.secretkey) {
    res.status(401).send('Unauthorized')
    return
  }

  const db = admin.database()
  return db.ref(domainId).child('rooms').child(roomId).set({
    description: roomName,
    assigned: false,
    done: false,
    meta: meta
  }).then(() => {
    const ref = db.ref(domainId).child('messages').child(roomId).push()
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

/* ============== record function for MERS =============== */

const GREEN = '#529a86'
const RED = '#ff6f69'
const YELLOW = '#ffeead'
const WHITE = '#ffffff'

const calcDiffDay = function (ts1, ts2) {
  const diff = ts2 - ts1
  return (((diff / 1000) / 60) / 60) / 24
}

function updateColor (specId, groupKey, guid, color) {
  const db = admin.database()
  console.log('set color to ', color)
  return db.ref('records').child(specId).child(groupKey).child(guid).child('color').set(color)
}

exports.updateMersStatus = functions.https.onRequest((req, res) => {
  const db = admin.database()
  const tasks = []
  db.ref('mersTrack').once('value', snapshot => {
    console.log('this should be once')
    snapshot.forEach(childSnapshot => {
      const reportGuid = childSnapshot.key
      console.log('key ->', reportGuid)
      const data = childSnapshot.val()
      const specId = data['specId']
      const groupKey = data['groupKey']
      // today
      const now = new Date().getTime()
      const days = calcDiffDay(data.arrivalDate, now)
      console.log('days', days)
      if (days > 14) {
        if (data.followDate !== undefined) {
          if (calcDiffDay(data.followDate, data.arrivalDate) > 14) {
            tasks.push(updateColor(specId, groupKey, reportGuid, GREEN))
          } else {
            tasks.push(updateColor(specId, groupKey, reportGuid, RED))
          }
        }
      } else {
        if (data.followDate !== undefined) {
          if (calcDiffDay(data.followDate, data.arrivalDate) > 7) {
            tasks.push(updateColor(specId, groupKey, reportGuid, YELLOW))
          } else {
            tasks.push(updateColor(specId, groupKey, reportGuid, WHITE))
          }
        } else {
          tasks.push(updateColor(specId, groupKey, reportGuid, YELLOW))
        }
      }
    })
  })
  return Promise.all(tasks).then(() => {
    res.send('ok').status(200)
  })
})

function mersTrackRegister (reportRef, arrivalDate, groupKey, specId) {
  const guid = reportRef.key
  const db = admin.database()
  console.log('create mersTrack')
  return db.ref('mersTrack').child(guid).set({
    arrivalDate: arrivalDate.getTime(),
    groupKey: groupKey,
    specId: specId,
    followDate: arrivalDate.getTime()
  })
}

function mersUpdateFollowDate (guid, followDateTimestamp) {
  const db = admin.database()
  return db.ref('mersTrack').child(guid).update({
    followDate: followDateTimestamp
  })
}

function mersUnTrackRegister (guid) {
  const db = admin.database()
  return db.ref('mersTrack').child(guid).remove()
}

exports.mersFollow = functions.database.ref('/records/{spec_id}/{groupKey}/{guid}').onWrite(event => {
  if (!event.data.exists()) {
    return
  }
  const followRecord = event.data.val()
  if (followRecord.parentReportGuid !== '' && followRecord.parentReportGuid !== undefined) {
    const targetRef = event.data.ref.parent.parent.parent.child(followRecord.parentRecordSpecId).child(event.params.groupKey).child(followRecord.parentReportGuid)
    const followDateLongValue = followRecord.startDate
    console.log('targetRef', targetRef.path)
    console.log('followDate', followDateLongValue)
    console.log('formDataRef', targetRef.child('formData').path)
    return targetRef.child('formData').once('value').then(snapshot => {
      const formData = JSON.parse(snapshot.val())
      if (formData['arrival_date'] !== undefined) {
        const arrivalDate = new Date(formData['arrival_date'])
        const days = calcDiffDay(arrivalDate.getTime(), followDateLongValue)
        if (days >= 14) {
          return targetRef.update({
            'color': GREEN,
            'lastFollowDate': followDateLongValue
          }).then(() => {
            return mersUnTrackRegister(followRecord.parentReportGuid)
          })
        } else {
          return targetRef.update({
            'color': '#ffffff',
            'lastFollowDate': followDateLongValue
          }).then(() => {
            return mersUpdateFollowDate(followRecord.parentReportGuid, followDateLongValue)
          })
        }
      }
    })
  }
})

/*
 * Trigger when volunteer create a new report that capture person who came back from Hajj
 */
exports.mersUpdateStatusFromFormData = functions.database.ref('/records/{specId}/{groupKey}/{guid}/formData').onWrite(event => {
  if (!event.data.exists()) { // Skip deleted case
    return
  }
  if (!event.data.previous.exists()) { // Focus only inserted case
    const formData = JSON.parse(event.data.val())
    if (formData['arrival_date'] !== undefined) {
      const arrivalDate = new Date(formData['arrival_date'])
      const days = calcDiffDay(arrivalDate.getTime(), new Date().getTime()) // Number of days after came back from Hajj.
      let color = '#ffffff'
      if (days > 14) {
        color = RED
      } else if (days > 7) {
        color = YELLOW
      }
      console.log('update color to ', color)
      return event.data.ref.parent.child('color').set(color).then(() => {
        return mersTrackRegister(event.data.ref.parent, arrivalDate, event.params['groupKey'], event.params['specId'])
      })
    }
  } else {
    console.log('updated cases')
  }
})
