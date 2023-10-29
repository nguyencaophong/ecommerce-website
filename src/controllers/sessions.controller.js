const catchAsync = require('../middleware/catcher.middleware')
const Session = require('../models/session.model')

module.exports.read = catchAsync(async (req, res) =>{
  res.json(await new Session(req.params.id, req.payload).read())
})

module.exports.delete = catchAsync(async (req, res) => {
  if (req.params.id === req.session.id)
    return res.status(403).json('Unable to logout of this current session!')

  await new Session(
    req.params.id || req.session.id,
    req.params.id ? undefined : req.payload
  ).delete()

  res.json('Logged out successfully.')
})
