const jwt = require('jsonwebtoken');

const genCode = length => '0'.repeat( length ).split( '' ).map( () => Math.floor( Math.random() * 10 ) ).join( '' )

const genRandomChars = () => {
  const chars = "!@#$%^&*_+~`\:?/-=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return chars.charAt(Math.floor(Math.random() * chars.length));
}

const genTokenJWT= (payload,secret,expireIn)=>{
  return jwt.sign(payload,secret,{expiresIn:expireIn});
}

module.exports = {genCode,genRandomChars,genTokenJWT}


