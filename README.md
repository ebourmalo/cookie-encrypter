# [cookie-encrypter](https://github.com/ebourmalo/cookie-encrypter)

[![npm](https://img.shields.io/npm/v/cookie-encrypter.svg)](https://www.npmjs.com/package/cookie-encrypter)
[![npm](https://img.shields.io/npm/dm/cookie-encrypter.svg)](https://www.npmjs.com/package/cookie-encrypter)

Transparently encrypt/decrypt your cookie using an express middleware to set after the  [cookie-parser](https://github.com/expressjs/cookie-parser).
Support all type of cookie (including http-only and signed) with string content or JSON.
Use `aes256` as the default encryption algorithm (internally use the nodejs [crypto](https://nodejs.org/api/crypto.html) module).

## Installation

```sh
$ npm install cookie-encrypter
```

## Example

Easy to use:
```js
const express = require('express')
const cookieParser = require('cookie-parser')
const cookieEncrypter = require('cookie-encrypter')
// we use a 32bits long secret key (with aes256)
const secretKey = 'foobarbaz1234567foobarbaz1234567'
const cookieParams = {
  httpOnly: true,
  signed: true,
  maxAge: 300000
}

const app = express()
app.use(cookieParser(secretKey))
// use it as a simple middleware
app.use(cookieEncrypter(secretKey))

app.get('/setcookies', (req, res) => {
  // Set encrypted cookies
  res.cookie('supercookie', 'my text is encrypted', cookieParams)
  res.cookie('supercookie2', { myData: 'is encrypted' }, cookieParams)

  // You can still set plain cookies
  res.cookie('plaincookie', 'my text is plain', { plain: true })
  res.cookie('plaincookie2', { myData: 'is plain' }, { plain: true })

  res.json({ status: 'updated' })
})

app.get('/getcookies', (req, res) => {
  console.log('Decrypted cookies: ', req.signedCookies)
  console.log('Plain cookies: ', req.cookies)

  res.json({ status: 'ok' })
})

app.listen(8080)
```

[You can find a ready-to-use example here](https://github.com/ebourmalo/cookie-encrypter/tree/master/example)
Think about the `npm install` before running it ;)

## API

### cookieEncrypter(secret, options)

- `secret` a string or array used for encrypting cookies.
- `options` an optional object to set options for encryption.
-  `options.algorithm` algorithm used to encrypt cookie data (any algorithm supported by OpenSSL). `aes256` used as the default one.

### cookieEncrypter.encryptCookie(str, options)

Encrypt a cookie value and return it. An `options.algorithm` can optionaly be passed to specify an algorithm to use for the encryption.

### cookieEncrypter.decryptCookie(str, options)

Decrypt a cookie value and return it. An `options.algorithm` can optionaly be passed to specify an algorithm to use for the decryption.


## CHANGELOG

[See the changelog](https://github.com/ebourmalo/cookie-encrypter/blob/master/CHANGELOG.md)
