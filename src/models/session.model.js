const Error = require('../utils/app_error.util')
const SessionSchema = require('../schemas/session.schema')
const Visit = require('../models/visit.model')
module.exports = class Session {
  id
  #_uid
  #device
  #hardware
  #software

  constructor(
    id,
    _uid,
    device,
    hardware,
    software,
  ) {
    this.id = id
    this.#_uid = _uid
    this.#device = device
    this.#hardware = hardware
    this.#software = software
  }

  create = () => new Promise((resolve,reject) =>{
    const session = new SessionSchema({
        _uid: this.#_uid,
        device: this.#device,
        hardware: this.#hardware,
        software: this.#software
    })

    session.save()
        .then(session => resolve(session))
        .catch(err => reject(err))
  })

  read = () => new Promise(async (resolve, reject) => {
    const sessions = this.id
      ? await SessionSchema.findById(this.id)
      : await SessionSchema.find({ _uid: this._uid })

    if (this.id ? !sessions : !sessions.length)
      return reject(new Error(404, 'Session not found!'))

    resolve(sessions)
  })

  update = () => new Promise(async (resolve, reject) => {
    const session = await SessionSchema.findByIdAndUpdate(
      this.id,
      { _uid: this._uid,device: this.#device, hardware: this.#hardware, software: this.#software },
      { new: true })

    if (!session) return reject(new Error(404, 'Session not found!'))
    await new Visit(undefined,this._uid,new Date(),this.#device,this.#hardware,this.#software).create();
    resolve(session)
  })

  delete = () => new Promise(async (resolve, reject) => {
    const sessions = this._uid
      ? await SessionSchema.deleteMany({ _id: { $ne: this.id }, _uid: this._uid })
      : await SessionSchema.findByIdAndDelete(this.id)

    if (this._uid ? !sessions?.deletedCount : !sessions)
      return reject(new Error(404, 'Session not found!'))

    resolve(sessions)
  })
}