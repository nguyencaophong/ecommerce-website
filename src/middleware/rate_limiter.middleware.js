const rateLimit = require('express-rate-limit');

module.exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100
});

module.exports.apiSignInLoginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window
  max: 4, // start blocking after 4 requests
  message: 'Too many request for playing/downloading audio from this IP. Please retry after few minutes'
});


