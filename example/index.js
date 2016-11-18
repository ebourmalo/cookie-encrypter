var express = require('express');
var cookieParser = require('cookie-parser');
var cookieEncrypter = require('./cook');
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

  res.json({
    encryptedCookies: req.signedCookies,
    plainCookies: req.cookies    
  })
});

app.listen(8080);

