const History = require('../schemas/history.schema')
const { ForbiddenError } = require('@casl/ability');
module.exports = class User {
  id
  #_uid
  #time
  #action
  #object

  constructor(
    id,
    _uid,
    time,
    action,
    object
  ) {
    this.id = id
    this.#_uid = _uid
    this.#time = time
    this.#action = action
    this.#object = object
  }

  create = () => new Promise((resolve,reject) =>{
    const history = new History({
        _uid: this.#_uid,
        time: this.#time,
        action: this.#action,
        object: this.#object
    })

    history.save()
        .then(history => resolve(history))
        .catch(err => reject(err))
  })

  list = (req) => new Promise((resolve,reject) =>{
    History.find().populate('_uid')
      .then(histories => {
        const result = [];
        for(let i of histories){
          const item = {
            _id: i._id,
            name: `${i._uid && i._uid.full_name.first+i._uid.full_name.last}`,
            email: i._uid && i._uid.email,
            phone: i._uid && i._uid.phone,
            time: i.time,
            action: i.action,
            object: i.object && i.object,
            createdAt: i.createdAt,
            updatedAt: i.updatedAt
          }
          result.push(item)
        }
        resolve(result)
      })
      .catch(err => reject(err))
  })
}