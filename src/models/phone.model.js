const Error = require('../utils/app_error.util.js')
const PhoneSchema = require('./../schemas/phone.schema');
const generator = require('../utils/generator.util.js');
const messenger = require('../common/services/phone.service.js');
module.exports = class Phone {
  id
  #number
  #attempts

  constructor(id, number, attempts = 3) {
    this.id = id
    this.#number = number
    this.#attempts = attempts
  }

  create = req => new Promise((resolve, reject) => PhoneSchema.findOne({ number: this.#number })
    .then(phone => {
      const code = generator.genCode(6);
      phone = phone || new PhoneSchema();
      phone.number = this.#number
      phone.code = code
      phone.attempts = this.#attempts
      phone.save()
        .then(phone => phone
          ? messenger.sendCode(req, phone.number, code)
            .then(msg => resolve(msg)
              || setTimeout(() => PhoneSchema.findById(phone)
                .then(phone => Date.now() > (new Date(phone.updatedAt).getTime() + 10 * 60 * 1000)
                  && phone.remove())
                , 10 * 60 * 1000))
            .catch(reject)
          : reject(new Error(404, 'Phone not found!')))
        .catch(reject)
    })
    .catch(reject))

  verify = req => new Promise((resolve, reject) => PhoneSchema.findOne({ number: this.#number })
    .then(phone => phone
      ? phone.attempts
        ? phone.verify(req.body.code)
          .then(correct => correct
            ? phone.remove().then(() => resolve(true)).catch(reject)
            : PhoneSchema.findByIdAndUpdate(phone, { $set: { attempts: --phone.attempts } }, { new: true })
              .then(phone => reject(new Error(phone.attempts ? 401 : 429, phone.attempts ? `'Wrong code!\nYou have '${phone.attempts}' attempts left.'` : 'You tried too many!\nPlease try again with a different verification code or change your phone number.')))
              .catch(reject))
          .catch(reject)
        : reject(new Error(429, 'You tried too many!\nPlease try again with a different verification code or change your phone number.'))
      : reject(new Error(404, 'Code not found!\nPlease click to \"Send Code\".')))
    .catch(reject))
}