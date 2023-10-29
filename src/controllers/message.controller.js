const Email = require('../models/email.model');
const ConversationSchema = require('../schemas/conversation.schema');
const MessageSchema = require('../schemas/message.schema');
const catchAsync = require('../middleware/catcher.middleware');

const AppError = require('../utils/app_error.util');
const Pagination = require('../utils/pagination.util');

module.exports.create = catchAsync(async (req, res, next) => {
  const { conversation, text, ...body } = req.body; // images
  let newMessageInput = {
    conversation,
    text: text || '',
    sender: req.user._id,
    ...body,
  };
  if (Object.values(req.files).length > 0) {
    const listImages = Object.values(req.files).map(
      (file) => `/images/${file.fieldname}/${file.filename}`,
    );
    newMessageInput.images = listImages;
  }
  const newMessage = new MessageSchema(newMessageInput);
  await newMessage.save();
  const message = await newMessage.populate({
    path: 'sender',
    select: '_id full_name avatar status loggedAt',
  });
  return res.json(message);
});
module.exports.read = catchAsync(async (req, res, next) => {
  if (!req.params.conversationId) {
    return next(new AppError('conversationId is required!', 400));
  }
  const features = new Pagination(
    MessageSchema.find({
      conversation: req.params.conversationId,
    }).populate({
      path: 'sender',
      select: '_id full_name avatar status loggedAt',
    }),
    req.query,
  )
    .pagination()
    .searching()
    .sorting()
    .filtering();

  const messages = await features.query;
  const countDocuments = await MessageSchema.countDocuments({
    conversation: req.params.conversationId,
  });
  return res.json({
    message: 'read',
    data: messages.reverse(),
    countDocuments,
  });
});
module.exports.getLatestMessage = catchAsync(async (req, res, next) => {
  if (!req.params.conversationId) {
    return next(new AppError('conversationId is required!', 400));
  }
  const message = await MessageSchema.findOne(
    {
      conversation: req.params.conversationId,
    },
    {},
    { sort: { createdAt: '-1' } },
  ).populate({
    path: 'sender',
    select: '_id full_name avatar status loggedAt',
  });
  if (!message)
    return next(new AppError('The latest messages could not be found!', 404));
  res.json({ message: 'get latest messages', data: message });
});

module.exports.getUnseenMessages = catchAsync(async (req, res, next) => {
  if (!req.params.conversationId || !req.params.receiverId) {
    return next(
      new AppError('conversationId and receiverId are required!', 400),
    );
  }
  const numberUnseen = await MessageSchema.countDocuments({
    conversation: req.params.conversationId,
    sender: req.params.receiverId,
    seen: false,
  });
  res.json(numberUnseen);
});

module.exports.update = catchAsync(async (req, res, next) => {
  const { conversationId, receiverId } = req.params;
  if (!conversationId || !receiverId) {
    return next(
      new AppError('conversationId and receiverId are required!', 400),
    );
  }
  await MessageSchema.updateMany(
    {
      conversation: conversationId,
      sender: receiverId,
      seen: false,
    },
    {
      seen: true,
      seenAt: Date.now(),
    },
  );
  return res.json({ message: 'Cập nhật tin nhắn thành công !' });
});
