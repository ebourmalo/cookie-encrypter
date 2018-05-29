v1.0.1 / 2018-05-29
===================

  * Use initialization vector for encryption to improve security [#5](https://github.com/ebourmalo/cookie-encrypter/commit/31c9078676687eedde4018a75b831cf248f6fb7d)
  * Add checks and throw errors at initialisation if wrong options are passed
  * Update code to ES6

v0.2.3 / 2016-11-18
===================

  * Update README and add example for both cases (encrypted cookies and plain cookies)

v0.2.0 / 2016-11-18
===================

  * Add an option to `res.cookie` to set plain cookie (without encryption). Thanks to @skarbovskiy for [his PR](https://github.com/ebourmalo/cookie-encrypter/pull/2)
