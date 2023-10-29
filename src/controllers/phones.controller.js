const Phone = require('../models/phone.model')

module.exports.create = (req, res, next) => new Phone(undefined, req.body.numb)
  .create(req)
  .then(msg => res.status(201).json({message:'msg'}))
  .catch(next)
