const VisitSchema = require('../schemas/visit.schema')

module.exports = class Session {
  id
  _uid
  #time
  #device
  #os
  #browser
  #location

  constructor(
    id,
    _uid,
    time,
    device,
    os,
    browser,
    location
  ) {
    this.id = id
    this._uid = _uid
    this.#time = time
    this.#device = device
    this.#os = os
    this.#browser = browser
    this.#location = location
  }

  list = (req) => new Promise((resolve, reject) => {
    VisitSchema.find().populate('_uid')
      .then(visits => {
        const result = [];
        for(let i of visits){
          const item = {
            _id: i._id,
            user: i._uid ? true : false,
            time: i.time,
            device: i.device,
            browser: i.browser,
            os:i.os,
            createdAt: i.createdAt,
            updatedAt: i.updatedAt
          }
          result.push(item)
        }
        resolve(result)
      })
      .catch(err => reject(err))
  })

  create = () => new Promise((resolve, reject) => {
    const visit = new VisitSchema({
      _uid:this._uid,
      time: this.#time,
      device: this.#device,
      os: this.#os,
      browser: this.#browser,
      location: this.#location
    })
    visit.save()
      .then(visit => resolve(visit))
      .catch(err => reject(err))
  })
}