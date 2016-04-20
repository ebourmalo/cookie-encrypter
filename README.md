# cookie-encrypter

Express middleware to use with [cookie-parser](https://github.com/expressjs/cookie-parser).
Transparently encrypt and decrypt cookies with `req.cookies` (populated by cookie-parser).
Support all cookies (including http-only and signed) with string content or JSON.
Use `aes256` as the default encryption algorithm.

## Installation

```sh
$ npm install cookie-encrypter
```

## API

```js
var express = require('express');
var cookieParser = require('cookie-parser');
var cookieEncrypter = require('cookie-encrypter');
var secretKey = 'foobarbaz12345';

var app = express();
app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));
```

### cookieEncrypter(secret, options)

- `secret` a string or array used for encrypting cookies.
- `options` an optional object to set options for encryption.
-  `options.algorithm` algorithm used to encrypt cookie data (any algorithm supported by OpenSSL). `aes256` used as the default one.

### cookieEncrypter.encryptCookie(str, options)

Encrypt a cookie value and return it. An `options.algorithm` can optionaly be passed to specify an algorithm to use for the encryption.

### cookieEncrypter.decryptCookie(str, options)

Decrypt a cookie value and return it. An `options.algorithm` can optionaly be passed to specify an algorithm to use for the decryption.

## Example

```js
var express = require('express');
var cookieParser = require('cookie-parser');
var cookieEncrypter = require('cookie-encrypter');
var secretKey = 'foobarbaz12345';

var app = express();
app.use(cookieParser(secretKey));
app.use(cookieEncrypter(secretKey));

app.get('/setcookies', function(req, res) {
  const cookieParams = {
    httpOnly: true,
    signed: true,
    maxAge: 300000,
  };

  res.cookie('supercookie', 'my data is encrypted', cookieParams);
  // OR ALTERNATIVELY
  // res.cookie('supercookie', { myData: 'is encrypted' }, cookieParams);
  
  res.end('new cookie set (supercookie)');
})

app.get('/getcookies', function(req, res) {
  console.log("Decrypted cookies: ", req.cookies)
});

app.listen(8080);
```
