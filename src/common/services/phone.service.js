const { SGODWEB_NODE_ENV, SGODWEB_MESSENGER_ID, SGODWEB_MESSENGER_TOKEN, SGODWEB_MESSENGER_PHONE } = require('process').env

module.exports.sendCode = (req, phone, code) => SGODWEB_NODE_ENV === 'development'
  ? new Promise(resolve => resolve(code))
  : new Promise(resolve =>
    require('twilio')(SGODWEB_MESSENGER_ID, SGODWEB_MESSENGER_TOKEN, { lazyLoading: true }).messages
      .create({
        body: `'Verification code:' ${code}\n'Please do not reply!'`,
        to: phone,
        from: SGODWEB_MESSENGER_PHONE
      }).then(() => resolve('We have sent a verification code to your phone.\nPlease enter code to below.')))
