function router(app) {
  app
    .use('/auth', require('./auth.routes'))
    .use('/emails', require('./emails.routes'))
    .use('/phones', require('./phones.routes'))
    .use('/users', require('./users.routes'))
    .use('/students', require('./students.routes'))
    .use('/', require('./web.routes'))
    .use('/conversations', require('./conversation.routes'))
    .use('/messages', require('./message.routes'))
    .use('/upload', require('./upload.routes'));
}

module.exports = router;
