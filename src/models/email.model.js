const EmailSchema = require('../schemas/email.schema');
const Error = require('../utils/app_error.util');
const generator = require('../utils/generator.util');
const mailer = require('../common/services/mail/mail.service');
const { SGODWEB_NODE_ENV, SGODWEB_MAILER_KEY, SGODWEB_MAILER_ADDR } =
  require('process').env;
module.exports = class Email {
  id;
  #address;
  #attempts;

  constructor(id, address, attempts = 3) {
    this.id = id;
    this.#address = address;
    this.#attempts = attempts;
  }

  create = (req) =>
    new Promise((resolve, reject) =>
      EmailSchema.findOne({ address: this.#address })
        .then(async (email) => {
          const code = generator.genCode(6);
          email = email || new EmailSchema();
          email.address = this.#address;
          email.code = code;
          email.attempts = this.#attempts;
          await email.save();

          const payload = {
            email: this.#address,
            title: 'Verify Email',
            code,
            SGODWEB_NODE_ENV: SGODWEB_NODE_ENV,
            SGODWEB_MAILER_KEY: SGODWEB_MAILER_KEY,
            SGODWEB_MAILER_ADDR: SGODWEB_MAILER_ADDR,
          };
          const msg = await mailer.sendCode(payload);
          if (!msg) {
            setTimeout(() => {
              this.EmailSchema.findById(email?._id.toString()).then(
                (email) =>
                  email &&
                  Date.now() >
                    new Date(email['updatedAt']).getTime() + 10 * 60 * 1000 &&
                  email.remove(),
              );
            }, 10 * 60 * 1000);
          }
          resolve(msg);
        })
        .catch(reject),
    );

  verify = (req) =>
    new Promise((resolve, reject) =>
      EmailSchema.findOne({ address: this.#address })
        .then((email) =>
          email
            ? email.attempts
              ? email
                  .verify(req.body.code)
                  .then((correct) =>
                    correct
                      ? email
                          .remove()
                          .then(() => resolve(true))
                          .catch(reject)
                      : EmailSchema.findByIdAndUpdate(
                          email,
                          { $set: { attempts: --email.attempts } },
                          { new: true },
                        )
                          .then((email) =>
                            reject(
                              new Error(
                                email.attempts
                                  ? `'Wrong code!\nYou have '${email.attempts}' attempts left.'`
                                  : 'You tried too many!\nPlease try again with a different verification code or change your email.',
                                email.attempts ? 401 : 429,
                              ),
                            ),
                          )
                          .catch(reject),
                  )
                  .catch(reject)
              : reject(
                  new Error(
                    'You tried too many!\nPlease try again with a different verification code or change your email address.',
                    429,
                  ),
                )
            : reject(
                new Error('Code not found!\nPlease click to "Send Code".', 404),
              ),
        )
        .catch(reject),
    );
};
