import Vue from 'vue'

function setError (base, fieldName, key, value) {
  base.$errors[fieldName] = base.$errors[fieldName] || {}
  base.$errors[fieldName][key] = value

  if (value) {
    base.$valid = false
  }
}

function validFnEmpty (value) {
  return value && value !== '' && value !== {}
}

function validFnMinLength (value) {
  return value && value.length >= this.minLength
}

function validFnEmail (value) {
  return value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
}

function validFnFacebookEmail (value) {
  return !value.match(/@facebook.com$/)
}

function validFnPostcode (value) {
  return value && value.match(/^[0-9]{5}$/)
}

function validFnPhone (value) {
  return value && value.trim().match(/^[0-9+-]{9,15}$/)
}

function validFnCCExpired (value) {
  if (value && value.replace(/\s+/g, '').match(/^[0-9/]{5}$/)) {
    let [m, y] = value.split('/')
    m = parseInt(m)
    y = parseInt(y)

    const minM = ((new Date()).getMonth() + 1).toString().padStart(2, 0)
    const minY = (new Date()).getFullYear().toString().slice(2)
    const curM = m.toString().padStart(2, 0)
    const curY = y.toString().padStart(2, 0)

    if (`${curY}${curM}` < `${minY}${minM}`) {
      return false
    }

    if ((m > 0) && (m < 13) && (y > 0) && (y < 99)) {
      return true
    }
  }

  return false
}

function validFnCVV (value) {
  return value && value.replace(/\s+/g, '').match(/^[0-9]{3,4}$/)
}

function validFnCCNumber (value) {
  return value && value.replace(/\s+/g, '').match(/^[0-9]{15,16}$/)
}

function validFnHour (value) {
  const parsed = parseInt(value)
  return value && (parsed >= 0) && parsed <= 23
}

function validFnMinute (value) {
  const parsed = parseInt(value)
  return value && (parsed >= 0) && parsed <= 59
}

function validFnAmount (value) {
  return value && value.replace(/,/g, '').match(/^[0-9]+(\.[0-9]{2})?$/)
}

function validFnProvince (value) {
  return value && Vue.prototype.$utils.provincesMap[value]
}

function _passScore (value) {
  let score = 0
  let lastCharCode = null
  let currentContinuousSeq = 0
  for (let i of Object.keys(value.split(''))) {
    const c = value[i]
    if (c.match(/[a-zA-Z0-9]/)) {
      score += 10
    }

    if (c.match(/!@#$%\^&*\(\)_+-=\[]\{\}\\|;:'",<\.>\/\?/)) {
      score += 15
    }

    const charCode = c.charCodeAt(0)
    if (lastCharCode && (
        (lastCharCode + 1 === charCode && (!value[i - 2] || (value.charCodeAt(i - 2) + 1 === lastCharCode))) ||
        (lastCharCode - 1 === charCode && (!value[i - 2] || (value.charCodeAt(i - 2) - 1 === lastCharCode))))) {
      currentContinuousSeq++
    } else {
      if (currentContinuousSeq > 2) {
        score -= currentContinuousSeq * 2.5
      }
      currentContinuousSeq = 0
    }
    lastCharCode = charCode
  }
  score -= currentContinuousSeq * 2.5

  if (value.replace(/[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}\\|;:'",<.>/?]*/, '').trim().length > 0) {
    score += 10
  }

  let matched = value.match(/([a-zA-Z0-9])\1+/)
  if (matched) {
    score -= matched[0].length * 5
  }

  return score >= 70
}

function validFnPassword (value) {
  return value && value.length >= 6 && _passScore.bind(this)(value)
}

function validFnMatch (value) {
  return value && value === this.anotherValue
}

function checkValid (base, fieldName, validateFunc, propName) {
  propName = propName || 'valid'
  if (!validateFunc(base.$target[fieldName])) {
    setError(base, fieldName, propName, true)
  } else {
    setError(base, fieldName, propName, false)
  }
}

function validate (base) {
  base.$valid = true

  for (let fieldName of Object.keys(base.$defs)) {
    const def = base.$defs[fieldName]
    const step = def.step === undefined ? true : def.step
    base.$errors[fieldName] = {}

    if (def['required']) {
      if (!def['required'].call(base)) {
        continue
      }
    }

    if (def['dependOn']) {
      const dependOn = def['dependOn']
      if (base.$target[dependOn.field] !== dependOn.value) {
        continue
      }
    }

    for (let check of Object.keys(def)) {
      switch (check) {
        case 'checkEmpty':
          checkValid(base, fieldName, validFnEmpty, 'empty')
          break
        case 'minLength': {
          let fnThis = {
            minLength: def.minLength
          }
          let fn = validFnMinLength.bind(fnThis)
          checkValid(base, fieldName, fn, 'minLength')
          break
        }
        case 'checkEmail':
          checkValid(base, fieldName, validFnEmail)
          break
        case 'checkPhone':
          checkValid(base, fieldName, validFnPhone)
          break
        case 'checkPostcode':
          checkValid(base, fieldName, validFnPostcode)
          break
        case 'checkPassword':
          checkValid(base, fieldName, validFnPassword.bind({ base: base }), 'tooEasy')
          break
        case 'checkMatch': {
          let fnThis = {
            anotherValue: base.$target[def.checkMatch]
          }
          let fn = validFnMatch.bind(fnThis)
          checkValid(base, fieldName, fn, 'unmatched')
          break
        }
        case 'checkCreditCardExpired': {
          checkValid(base, fieldName, validFnCCExpired)
          break
        }
        case 'checkCreditCardCVV': {
          checkValid(base, fieldName, validFnCVV)
          break
        }
        case 'checkCreditCardNumber': {
          checkValid(base, fieldName, validFnCCNumber)
          break
        }
        case 'checkHour': {
          checkValid(base, fieldName, validFnHour)
          break
        }
        case 'checkMinute': {
          checkValid(base, fieldName, validFnMinute)
          break
        }
        case 'checkAmount': {
          checkValid(base, fieldName, validFnAmount)
          break
        }
        case 'checkProvince': {
          checkValid(base, fieldName, validFnProvince)
          break
        }
        case 'checkFacebookEmail': {
          checkValid(base, fieldName, validFnFacebookEmail, 'facebookEmail')
          break
        }
      }

      if (step && isError(base, fieldName)) {
        break
      }
    }
  }

  return base.$valid
}

function isError (base, fieldName) {
  return base.$errors[fieldName] && Object.keys(base.$errors[fieldName]).reduce((a, b) => {
    return a + (base.$errors[fieldName][b] ? 1 : 0)
  }, 0) > 0
}

export default {
  install (Vue, options) {
    Vue.prototype.$validator = {
      init (target, definitions) {
        let base = {
          $target: target,
          $defs: definitions,
          $valid: true,
          setError: (field, key, value) => {
            setError(base, field, key, value)
          },
          checkValid: (field, fn) => {
            checkValid(base, field, fn)
          },
          validate: () => {
            return validate(base)
          },
          isError: (field) => {
            return isError(base, field)
          },
          $errors: {}
        }

        for (let fieldName of Object.keys(definitions)) {
          base.$errors[fieldName] = {}
        }

        return base
      }
    }
  }
}
