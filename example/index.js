const express = require('express')
const cookieParser = require('cookie-parser')
const cookieEncrypter = require('../index')
// we use a 32bits long secret key (with aes256)
const secretKey = 'foobarbaz1234567foobarbaz1234567'

const app = express()
app.use(cookieParser(secretKey))
app.use(cookieEncrypter(secretKey))

app.get('/setcookies', function(req, res) {
  const cookieParams = {
    httpOnly: true,
    signed: true,
    maxAge: 300000
  }

  // Set encrypted cookies
  res.cookie('supercookie', 'my text is encrypted', cookieParams)
  res.cookie('supercookie2', { myData: 'is encrypted' }, cookieParams)

  // You can still set plain cookies
  res.cookie('plaincookie', 'my text is plain', { plain: true })
  res.cookie('plaincookie2', { myData: 'is plain' }, { plain: true })

  res.json({ status: 'updated' })
})

app.get('/getcookies', function(req, res) {
  console.log('Decrypted cookies: ', req.signedCookies)
  console.log('Plain cookies: ', req.cookies)

  res.json({
    encryptedCookies: req.signedCookies,
    plainCookies: req.cookies    
  })
})

app.listen(8080)
