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
const express = require('express');
const cookieParser = require('cookie-parser');
const cookieEncrypter = require('./cook');
const app = express();
const secretKey = 'foobarbaz12345';

app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));

app.get('/setcookies', function(req, res) {
  const cookieParams = {
    httpOnly: true,
    signed: true,
    maxAge: 300000,
  };

  // Set encrypted cookies
  res.cookie('supercookie', 'my text is encrypted', cookieParams);
  res.cookie('supercookie2', { myData: 'is encrypted' }, cookieParams);

  // You can still set plain cookies
  res.cookie('plaincookie', 'my text is plain', { plain: true });
  res.cookie('plaincookie2', { myData: 'is plain' }, { plain: true });

  res.end('new cookies set');
})

app.get('/getcookies', function(req, res) {
  console.log('Decrypted cookies: ', req.signedCookies)
  console.log('Plain cookies: ', req.cookies)
});
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
