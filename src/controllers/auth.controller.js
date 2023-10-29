const passport = require('passport');
const Email = require('../models/email.model');
const Phone = require('../models/phone.model');
const User = require('../models/user.model');
const { isEmail, isPhone, isStrongPassword } = require('../utils/checker.util');
const catchAsync = require('../middleware/catcher.middleware');
const { genTokenJWT } = require('../utils/generator.util');
const UserSchema = require('../schemas/user.schema');
const SessionModel = require('../models/session.model');
const {
  SGODWEB_REFRESH_TOKEN,
  SGODWEB_EXPIRE_ACCESS_TOKEN,
  SGODWEB_EXPIRE_REFRESH_TOKEN,
  SGODWEB_ACCESS_TOKEN,
} = require('process').env;

module.exports.login = (req, res, next) => {
  const { device, hardware, software } = req.body;
  if (!hardware) {
    return res.status(400).json({ message: 'Hardware is required!' });
  }
  if (!software) {
    return res.status(400).json({ message: 'Software is required!' });
  }
  if (!device) {
    return res.status(400).json({ message: 'Device is required!' });
  }
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        message: err,
      });
    }
    req.login(user, { session: false }, async (err) => {
      if (err) {
        res.send(err);
      }
      const payloadJwt = {
        _id: user._id,
        username: user.username,
      };
      // generate a signed son web token with the contents of user object and return it in the response
      const access_token = genTokenJWT(
        payloadJwt,
        SGODWEB_ACCESS_TOKEN,
        SGODWEB_EXPIRE_ACCESS_TOKEN,
      );
      const refresh_token = genTokenJWT(
        payloadJwt,
        SGODWEB_REFRESH_TOKEN,
        SGODWEB_EXPIRE_REFRESH_TOKEN,
      );

      const userUpdated = await UserSchema.findByIdAndUpdate(
        user._id,
        {
          refresh_token,
          status: 'online',
          loggedAt: Date.now(),
        },
        { new: true },
      ).populate('roles');
      await new SessionModel(
        undefined,
        req.user._id.toString(),
        device,
        hardware,
        software,
      ).create();
      const { password, ..._user } = userUpdated['_doc'];
      return res.json({ ..._user, access_token, refresh_token });
    });
  })(req, res);
};

module.exports.logout = async (req, res, next) => {
  await UserSchema.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refresh_token: null, status: 'offline', loggedAt: Date.now() },
    },
    { new: true },
  );
  res.status(200).json();
};

module.exports.refresh = async (req, res, next) => {
  return passport.authenticate(
    'refresh',
    { session: false },
    async (err, user, info) => {
      if (user) {
        const regex = /Bearer|bearer/g;
        const refreshToken = req
          ?.get('authorization')
          ?.replace(regex, '')
          .trim();
        if (user.refresh_token !== refreshToken) {
          return res.status(401).json({
            error: 'Refresh token is invalid',
          });
        }
        const payloadJwt = {
          _id: user._id,
          username: user.username,
        };
        // generate a signed son web token with the contents of user object and return it in the response
        const access_token = genTokenJWT(
          payloadJwt,
          SGODWEB_ACCESS_TOKEN,
          SGODWEB_EXPIRE_ACCESS_TOKEN,
        );
        const refresh_token = genTokenJWT(
          payloadJwt,
          SGODWEB_REFRESH_TOKEN,
          SGODWEB_EXPIRE_REFRESH_TOKEN,
        );

        await UserSchema.findByIdAndUpdate(user._id, { refresh_token });
        return res.status(201).json({ access_token, refresh_token });
      }
      return res.status(401).json({
        error: 'Refresh token is invalid',
      });
    },
  )(req, res);
};

module.exports.resetPassword = catchAsync(async (req, res) => {
  const { username } = req.params;
  if (!isEmail(username) && !isPhone(username)) {
    return res.status(422).json('Invalid email address or phone number!');
  }

  let field;
  if (isEmail(username)) {
    field = 'email';
  } else if (isPhone(username)) {
    field = 'phone';
  }
  const userPresent = await UserSchema.findOne({
    [field === 'email' ? 'email' : 'phone']: username,
  });
  if (!userPresent) {
    return res.status(404).json('Username or password is incorrect.');
  }

  field === 'email'
    ? await new Email(undefined, username).verify(req)
    : await new Phone(undefined, username).verify(req);

  await new User(
    undefined,
    undefined,
    undefined,
    field === 'email' ? username : undefined,
    field === 'phone' ? username : undefined,
  ).changePassword(req.body.password);

  res.status(200).json('Change password successfully.');
});
