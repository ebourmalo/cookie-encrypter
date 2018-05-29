const crypto = require('crypto')
const util = require('util')
const defaultAlgorithm = 'aes256'

module.exports = cookieEncrypter
module.exports.encryptCookie = encryptCookie
module.exports.decryptCookie = decryptCookie

function ensureProperOptions(algorithm, key) {
  if (!key) {
    throw new TypeError('options.key argument is required to encrypt a string')
  }

  if (algorithm === 'aes256' && key.length !== 32) {
    const errorLabel = `A 32-bits key must be used with aes256. Given: ${key.length} (${key}-bits)`
    throw new Error(errorLabel)
  }
}

/**
 * Encrypt cookie string
 *
 * @param  {String} str     Cookie string
 * @param  {Object} options
 * @param  {Object} options.algorithm Algorithm to use to encrypt data
 * @param  {Object} options.key       Key to use to encrypt data
 *
 * @return {String}
 */
function encryptCookie(str, options = {}) {
  const key = options.key
  const algorithm = options.algorithm || defaultAlgorithm

  ensureProperOptions(algorithm, key)

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    algorithm,
    key,
    iv
  )
  const encrypted = [
    iv.toString('hex'),
    ':',
    cipher.update(str, 'utf8', 'hex'),
    cipher.final('hex')
  ]

  return encrypted.join('')
}

/**
 * Decrypt cookie string
 *
 * @param  {String} str               Cookie string
 * @param  {Object} options
 * @param  {Object} options.algorithm Algorithm to use to decrypt data
 * @param  {Object} options.key       Key to use to decrypt data
 *
 * @return {String}
 */
function decryptCookie(str, options) {
  const key = options.key
  const algorithm = options.algorithm || defaultAlgorithm

  ensureProperOptions(algorithm, key)

  const encryptedArray = str.split(':')
  const iv = new Buffer(encryptedArray[0], 'hex')
  const encrypted = new Buffer(encryptedArray[1], 'hex')
  const decipher = crypto.createDecipheriv(algorithm, key, iv)
  const decrypted = decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8')

  return decrypted
}

/**
 * Decrypt cookies coming from req.cookies
 *
 * @param  {Object} obj     req.cookies
 * @param  {Object} options
 * @param  {String} options.algorithm Algorithm to use to decrypt data
 * @param  {String} options.key       Key to use to decrypt data
 *
 * @return {Object}
 */
function decryptCookies(obj, options) {
  const cookies = {}

  Object.keys(obj).forEach(key => {
    const originalValue = obj[key]
    if (typeof originalValue !== 'string' || originalValue.substr(0, 2) !== 'e:') {
      return
    }

    try {
      const val = decryptCookie(originalValue.slice(2), options)
      if (val) {
        cookies[key] = JSONCookie(val)
      }
    } catch (error) {
      return
    }
  })

  return Object.assign(obj, cookies)
}

/**
 * Parse JSON cookie string.
 *
 * @param {String} str
 *
 * @return {Object} Parsed object or undefined if not json cookie
 */
function JSONCookie(str) {
  if (typeof str !== 'string' || str.substr(0, 2) !== 'j:') {
    return str
  }

  try {
    return JSON.parse(str.slice(2))
  } catch (err) {
    return str
  }
}

/**
 * @param  {String} secret
 * @param  {Object} options
 * @param  {Object} options.algorithm - any algorithm supported by OpenSSL
 */
function cookieEncrypter(secret, _options) {
  const defaultOptions = {
    algorithm: 'aes256',
    key: secret
  }

  const options = typeof _options === 'object'
    ? util._extend(defaultOptions, _options)
    : defaultOptions

  // try an encryption to ensure options are properly set
  try {
    encryptCookie('initialization test', options)
  } catch(error) {
    console.error(`[cookie-encrypter] ${error}. Could not initialize cookie-encrypter with options:`, options)

    throw error
  }

  return (req, res, next) => {
    const originalResCookie = res.cookie

    res.cookie = (name, value, opt) => {
      if (typeof opt === 'object' && opt.plain) {
        return originalResCookie.call(res, name, value, opt)
      }

      const val = typeof value === 'object'
        ? `j:${JSON.stringify(value)}`
        : String(value)

      const encryptedVal = `e:${encryptCookie(val, options)}`
      return originalResCookie.call(res, name, encryptedVal, opt)
    }

    if (req.cookies) {
      req.cookies = decryptCookies(req.cookies, options)
    }

    if (req.signedCookies) {
      req.signedCookies = decryptCookies(req.signedCookies, options)
    }

    next()
  }
}
