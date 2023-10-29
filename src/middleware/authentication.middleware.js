const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const passportJWT = require("passport-jwt");
const JWTStrategy   = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const createError = require('http-errors')
const UserSchema = require('../schemas/user.schema')
const {isPhone,isEmail} = require('../utils/checker.util')
const { SGODWEB_ACCESS_TOKEN ,SGODWEB_REFRESH_TOKEN} = require("process").env;
passport.use("local",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    async (username, password, done) => {
      const userPresent = await UserSchema.findOne({ 
        [isEmail(username) ? 'email' : isPhone(username) ? 'phone' : 'username']: username });
      if(!userPresent) {
        return done('Username or password is incorrect.')
      }
      if(!userPresent.authenticate(password)) {
        return done('Username or password is incorrect.')
      }
      if(userPresent.block.blocked) {
        return done('Your account has been locked, contact Sgod staff to open.')
      }
      done(null,userPresent);
    }
  )
);

passport.use("jwt",new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey   : SGODWEB_ACCESS_TOKEN,
  ignoreExpiration: false,
},
async (payload, done)=> {
  // find the user in db if needed. 
  // This functionality may be omitted if you store everything you'll need in JWT payload.
  const userPresent = await UserSchema.findById(payload._id);
  if(!userPresent) {
    return done(createError.Unauthorized())
  }
  return done(null,userPresent);
}));


passport.use("refresh",new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey   : SGODWEB_REFRESH_TOKEN,
  ignoreExpiration: false,
},
async (payload, done)=> {
  // find the user in db if needed. 
  // This functionality may be omitted if you store everything you'll need in JWT payload.
  const userPresent = await UserSchema.findById(payload._id);
  if(!userPresent) {
    return done(createError.Unauthorized())
  }
  return done(null,userPresent);
}));

