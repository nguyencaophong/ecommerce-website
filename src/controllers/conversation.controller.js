const Email = require('../models/email.model');
const ConversationSchema = require('../schemas/conversation.schema');

const AppError = require('../utils/app_error.util');
const catchAsync = require('../middleware/catcher.middleware');
const MessageSchema = require('../schemas/message.schema');

// ** CHECK PERMISSION
module.exports.create = catchAsync(async (req, res, next) => {
  const ID_ADMIN_ROOT = '643e5a1601f57ae09e22e1bd'; // example id of admin root
  let receiverId;
  if (String(req.user._id) === ID_ADMIN_ROOT) {
    // req.user là root thì
    if (!req.body.receiverId) {
      return next(new AppError('receiverId is required', 400));
    }
    receiverId = req.body.receiverId;
  } else {
    receiverId = ID_ADMIN_ROOT;
  }
  const newConversation = new ConversationSchema({
    members: [req.user._id, receiverId],
  });

  const conversation = await (
    await newConversation.save()
  ).populate({
    path: 'members',
    select: '_id full_name avatar status loggedAt',
  });
  // kiểm tra xem user có quyền admin hay không
  // nếu user k có quyền root thì tạo tin nhắn m
  if (!req.user.roles.includes('643e04f3f9db17a2684af699')) {
    const newMessage = await MessageSchema.create({
      conversation: String(conversation._id),
      sender: receiverId,
      text: 'Chào bạn. Tui có thể giúp gì cho bạn ?.',
    });
  }
  return res.json(conversation);
});
module.exports.read = catchAsync(async (req, res, next) => {
  const myConversations = await ConversationSchema.find({
    members: { $in: [req.user._id] },
  })
    .sort('-updatedAt')
    .populate({
      path: 'members',
      select: '_id full_name avatar status loggedAt',
    });
  res.json(myConversations);
});
module.exports.update = catchAsync(async (req, res, next) => {
  if (!req.params.conversationId) {
    return next(new AppError('conversationId is required!', 400));
  }
  const conversation = await ConversationSchema.findOneAndUpdate(
    { _id: req.params.conversationId },
    { updatedAt: Date.now() },
    { new: true },
  );
  if (!conversation) {
    return next(new AppError('Không tìm thấy conversation', 404));
  }
  return res.json(conversation);
});
