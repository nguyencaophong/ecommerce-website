const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const static = require('serve-static');
const { info } = require('console');
const cors = require('cors');

// socket
const { Server } = require('socket.io');
const { createServer } = require('http');
const socket = require('./socket');

// ** swagger
const YAML = require('yamljs');
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = YAML.load('./configs/swagger.yaml');
!process.env.SGODWEB_NODE_ENV && require('dotenv').config();

// ** connect database
require('./database/mongo.database');

const main = () => {
  const {
    SGODWEB_NODE_ENV,
    SGODWEB_WEB4,
    SGODWEB_WEB5,
    SGODWEB_WEB6,
    SGODWEB_TIMEOUT,
    SGODWEB_UPLOAD,
  } = require('process').env;
  const web = express();
  const admin = express();
  const api = express();
  const root = express();

  // create socket
  const httpServer = createServer(root);
  const io = new Server(httpServer, {
    cors: {
      origin: [SGODWEB_WEB4, SGODWEB_WEB5, SGODWEB_WEB6],
      credentials: true,
    },
  });

  // ** trust proxy
  api.get('env') === 'production' && api.set('trust proxy', 1);

  // ** register strategy local,jwt
  require('./middleware/authentication.middleware');
  // ** express middleware
  api
    .use(cookieParser())
    .use(express.text())
    .use(express.json())
    .use(express.urlencoded({ extended: true }))
    .use(require('compression')())
    .use(
      require('response-time')(
        (req, res, time) =>
          api.get('env') === 'development' &&
          info(`${req.method} ${req.baseUrl}${req.url} ${time}`),
      ),
    )
    .use(require('connect-timeout')(SGODWEB_TIMEOUT))
    .use(require('./middleware/logger.middleware'))
    .use(
      cors({
        origin: [SGODWEB_WEB4, SGODWEB_WEB5, SGODWEB_WEB6],
        credentials: true,
      }),
    );

  root.use(function (req, res, next) {
    res.setHeader(
      'Access-Control-Allow-Origin',
      SGODWEB_WEB4,
      SGODWEB_WEB5,
      SGODWEB_WEB6,
    );
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
  });

  // ** serving static file
  root.use(
    '/images',
    express.static(path.resolve(__dirname, `../${SGODWEB_UPLOAD}/images`)),
  );
  SGODWEB_NODE_ENV !== 'production' &&
    web.use(static(path.resolve(__dirname, '../../web'))) &&
    admin.use(static(path.resolve(__dirname, '../../admin')));

  // ** routes
  require('./routes')(api);
  require('./routes/admin')(api);

  // ** web
  SGODWEB_NODE_ENV !== 'production'
    ? web.get('*', (req, res) =>
        res.sendFile(path.join(__dirname, '../../web', 'index.html')),
      )
    : api.get('/', (req, res) =>
        res.send(`Started ${NAME} server is successfully!`),
      );
  // ** admin-web
  SGODWEB_NODE_ENV !== 'production'
    ? admin.get('*', (req, res) =>
        res.sendFile(path.join(__dirname, '../../admin', 'index.html')),
      )
    : api.get('/', (req, res) =>
        res.send(`Started ${NAME} server is successfully!`),
      );

  root.use('/api', api);
  SGODWEB_NODE_ENV !== 'production' &&
    root.use('/swagger', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

  // ** not found exception
  api.use(require('./middleware/not_found.middleware'));
  // ** exception global
  root.use(require('./middleware/handle.middleware'));

  // web.listen(4093, () => {
  //   console.log(`Web listening on port http://localhost:${4093}`);
  // })
  // admin.listen(4094, () => {
  //   console.log(`Admin listening on port http://localhost:${4094}`);
  // })
  httpServer.listen(4095, () => {
    console.log(`Server listening on port http://localhost:${4095}`);
    socket({ io });
  });
};

main();
