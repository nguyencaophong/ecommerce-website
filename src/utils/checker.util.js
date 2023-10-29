module.exports.isCode = value => /^\d{6}$/.test(value)

module.exports.isEmail = value => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(value)

module.exports.isPhone = value => /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(value)

module.exports.isStrongPassword = value => /(?=^.{8,}$)(?=.*\d)(?=.*[!@#$%^&*]+)(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/.test(value)

module.exports.isDate = (year, month, day, date = new Date(parseInt(month) + 1 + '/' + day + '/' + year)) => date.getFullYear() === parseInt(year) && date.getMonth() === parseInt(month) && date.getDate() === parseInt(day)

module.exports.isStatus = value => /^[1-5][0-9][0-9]$/ig.test(value)

module.exports.isUrl = value => /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/ig.test(value)

module.exports.isFilepath = value => /^(.+)\/([^\/]+)$/.test(value)

module.exports.isSize = (value, min = 0) => /^(\d+\-\d+)?$/.test(value) ? value.split('-').reduce((a, b) => parseInt(a) < parseInt(b) && parseInt(a) >= min) : /^(\d+\+)?$/.test(value)

module.exports.isObjectId = param => require('mongoose').isValidObjectId(param)

