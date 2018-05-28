const crypto = require('crypto')
const util = require('util')
const defaultAlgorithm = 'aes256'

module.exports = cookieEncrypter
module.exports.encryptCookie = encryptCookie
module.exports.decryptCookie = decryptCookie

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
function encryptCookie(str, options) {
  if (!options.key) {
    throw new TypeError('options.key argument is required to encryptCookie')
  }

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(
    options.algorithm || defaultAlgorithm,
    options.key,
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
  const encryptedArray = str.split(':')
  const iv = new Buffer(encryptedArray[0], 'hex')
  const encrypted = new Buffer(encryptedArray[1], 'hex')
  const decipher = crypto.createDecipheriv(
    options.algorithm || defaultAlgorithm,
    options.key,
    iv
  )
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
  const cookies = Object.keys(obj)

  Object.keys(cookies).forEach(key => {
    const originalValue = obj[key]
    if (typeof originalValue !== 'string' || originalValue.substr(0, 2) !== 'e:') {
      return
    }

    try {
      const val = decryptCookie(originalValue.slice(2), options)
      if (val) {
        obj[key] = JSONCookie(val)
      }
    } catch (error) {
      return
    }
  })

  return obj
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

  return (req, res, next) => {
    const originalResCookie = res.cookie

    res.cookie = (name, value, opt) => {
      if (typeof opt === 'object' && opt.plain) {
        return originalResCookie.call(res, name, value, opt)
      }

      const val = typeof value === 'object'
        ? 'j:' + JSON.stringify(value)
        : String(value)

      try {
        val = 'e:' + encryptCookie(val, options)
      } catch (error) {}

      return originalResCookie.call(res, name, val, opt)
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
