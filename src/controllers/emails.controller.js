const Email = require('../models/email.model')

module.exports.create = (req, res, next) => 
  new Email(undefined, req.body.addr)
    .create(req)
    .then(msg => res.status(201).json(msg))
    .catch(next)