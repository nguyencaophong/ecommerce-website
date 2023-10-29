const sgMail = require('@sendgrid/mail')
const {templateEmail} = require('./templates/email_verify')

module.exports.sendCode = (msg) => {
  try {
    sgMail.setApiKey(msg.SGODWEB_NODE_ENV === 'production' ? msg.SGODWEB_MAILER_KEY : 'SG.');
    if (msg.SGODWEB_NODE_ENV === 'development') {
      return msg.code;
    }
    sgMail.send({
      from: `SGOD <${msg.SGODWEB_MAILER_ADDR}>`,
      to: msg.email,
      subject: msg.title,
      html: templateEmail(msg.code)
    });
    return 'We have sent a verification code to your email.\nPlease enter code to below.';
  } catch (err) {
    console.log(err )
    return 'Email not sent';
  }
}
