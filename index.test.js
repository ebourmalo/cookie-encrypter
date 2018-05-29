const crypto = require('crypto')
const { decryptCookie, encryptCookie } = require('./index')

describe('encryptCookie', () => {

  function testEncyryptCookie(algorithm, keyLengthBytes) {
    const randomArrayString = Array.from({length: 40}, () => crypto.randomBytes(Math.floor(1 + Math.random() * 1000)).toString('hex'))
    randomArrayString.forEach(strToEncrypt => {
      it(`can encode an string with a ${keyLengthBytes} bytes key`, () => {
        const key = crypto.randomBytes(keyLengthBytes)
        expect(typeof encryptCookie(strToEncrypt, { algorithm, key })).toBe('string')
      })
    })

    const randomArrayBytesNumber = Array.from({length: 40}, () => Math.floor(1 + Math.random() * 1000)).filter(el => el !== keyLengthBytes)
    randomArrayBytesNumber.forEach(nbBytes => {
      it(`throw with a ${nbBytes} bytes key`, () => {
        const stringToEncrypt = 'StringToEncrypt'
        const key = crypto.randomBytes(nbBytes)
      
        expect(() => encryptCookie(stringToEncrypt, { algorithm, key })).toThrow()
      })
    })
  }

  describe('aes256 algorithm', () => {
    const algorithm = 'aes256' 
    const keyLengthBytes = 32
    testEncyryptCookie(algorithm, keyLengthBytes)
  })

  describe('aes-128-cbc algorithm', () => {
    const algorithm = 'aes-128-cbc' 
    const keyLengthBytes = 16
    testEncyryptCookie(algorithm, keyLengthBytes)
  })
})

describe('decryptCookie', () => {
  function testDecryptCookie(algorithm, keyLengthBytes) {
    it('can decode a string while using the good key', () => {
      const originalStr = crypto.randomBytes(Math.floor(1 + Math.random() * 1000)).toString('hex')
      const key = crypto.randomBytes(keyLengthBytes)
      const encyptedStr = encryptCookie(originalStr, { algorithm, key })

      expect(decryptCookie(encyptedStr, { algorithm, key })).toEqual(originalStr)
    })

    it('throw an error while decrypting using a wrong key', () => {
      const originalStr = crypto.randomBytes(Math.floor(1 + Math.random() * 1000)).toString('hex')
      const key = crypto.randomBytes(keyLengthBytes)
      const wrongKey = crypto.randomBytes(keyLengthBytes)
      const encyptedStr = encryptCookie(originalStr, { algorithm, key })

      expect(() => decryptCookie(encyptedStr, { algorithm, key: wrongKey })).toThrow()
    })

    it('throw an error while decrypting using a wrong-length key', () => {
      const originalStr = crypto.randomBytes(Math.floor(1 + Math.random() * 1000)).toString('hex')
      // use a different length
      const key = crypto.randomBytes(keyLengthBytes)
      const wrongSizeKey = key.toString('hex').substr(2)
      const encyptedStr = encryptCookie(originalStr, { algorithm, key })

      expect(() => decryptCookie(encyptedStr, { algorithm, key: wrongKey })).toThrow()
    })
  }

  describe('aes256 algorithm', () => {
    const algorithm = 'aes256' 
    const keyLengthBytes = 32
    
    testDecryptCookie(algorithm, keyLengthBytes)
  })

  describe('aes-128-cbc algorithm', () => {
    const algorithm = 'aes-128-cbc' 
    const keyLengthBytes = 16
    
    testDecryptCookie(algorithm, keyLengthBytes)
  })
})
