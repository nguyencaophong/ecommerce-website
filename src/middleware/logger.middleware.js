const fs = require('fs')
const morgan = require('morgan');

fs.existsSync('Logger') || fs.mkdirSync('Logger', { recursive: true })

module.exports = morgan('combined', { stream: fs.createWriteStream(require('path').resolve('Logger', 'logs.log'), { flags: 'a' }) })


