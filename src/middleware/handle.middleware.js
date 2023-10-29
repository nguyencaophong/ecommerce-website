const fs = require('fs');
const converter = require('../utils/converter.util');
const { SGODWEB_NODE_ENV } = require('process').env;

module.exports = (err, req, res, next) => {
  let status = err.status || 500,
    message = err.message || '';
  // const files = typeof req.files === 'object' && Object.values(req.files)?.map(v => v[0])
  const files = req.files;
  req.file && fs.existsSync(req.file.path) && fs.rmSync(req.file.path);
  files?.length &&
    files.map((file) => fs.existsSync(file.path) && fs.rmSync(file.path));
  files?.length &&
    files
      .map((file) => file.destination)
      .filter(
        (destination, i, destinations) =>
          destinations.indexOf(destination) === i && /id/.test(destination),
      )
      .map(
        (destination) =>
          fs.existsSync(destination) && fs.rmdirSync(destination),
      );

  SGODWEB_NODE_ENV !== 'production' && console.error(err);

  switch (err.name) {
    case 'ValidationError':
      status = 400;
      message = `'Validation Error!'\n${Object.values(err.errors)
        .map((e, i) => `${i + 1}.`)
        .join('! ')}!`;
      break;

    case 'JsonWebTokenError':
      status = 400;
      break;

    case 'TokenExpiredError':
      status = 401;
      break;

    case 'ForbiddenError':
      message = message.replace(/"+/g, '').split(' ');
      status = 403;
      message = 'You are not authorized to perform this action';
      break;

    case 'AxiosError':
      status = 501;
      message =
        err.response?.data?.response || err.response?.data || err.message;
      break;

    default:
      switch (err.message) {
        case 'Missing credentials':
          status = 400;
          message = 'Missing credentials!';
          break;

        default:
          switch (err.code) {
            case 13:
              status = 501;
              message = 'Authentication database failed!';
              break;

            case 11000:
              status = 422;
              message = converter.capitalize(
                Object.keys(err.keyValue)[0] + ' is taken!',
              );
              break;

            case 'ENOENT':
            case 'ENOTDIR':
            case 'ENOTEMPTY':
              status = 404;
              message = 'No such file or directory!';
              break;

            case 'ECONNREFUSED':
              status = 503;
              break;

            case 'EEXIST':
              status = 409;
              message = 'Directory already exists!';
              break;

            case 'ECONNREFUSED':
              status = 503;
              break;

            case 'LIMIT_UNEXPECTED_FILE':
              status = 400;
              message = 'Field not matched or files limit exceeded!';
              break;
            case 429:
              status = 429;
              message: 'Duplicate fields';
              break;
            default:
              return res.status(status).json({ message: message });
          }
      }
  }
  console.log(status, message);
  return res.status(status).json({ message: message });
};
