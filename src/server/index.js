// Utils
const { join } = require('path');

// Express
const express = require('express');
const app = express();

// Database
const mongoose = require('mongoose');
const crateMongodbMessageStore = require('mongodb-message-store');

// Database Models (view data)
const createUser = require('../models/user');
const createCube = require('../models/cube');

// Middleware
const loggerMiddleware = require('./middleware/logger-middleware');
const attachLocalsMiddleware = require('./middleware/attach-locals-middleware');
const errorHandlerMiddleware = require('./middleware/error-handler-middleware');
const prepRequestContextMiddleware = require('./middleware/prep-request-context-middleware');
const cookieSession = require('cookie-session');

// Applications
const createHomeApp = require('./apps/home');
const createRegisterUsersApp = require('./apps/register-users');
const createAuthenticateUsersApp = require('./apps/authenticate-users');
const createCreateCubesApp = require('./apps/create-cubes');
const createListCubesApp = require('./apps/list-cubes');
const createHandleCubeApp = require('./apps/handle-cube');

// Components
const createIdentityComponent = require('../components/identity');
const createCubesComponent = require('../components/cubes');

// Aggregators
const createUserCredentialsAggregator = require('../aggregators/user-credentials');
const createCubesAggregator = require('../aggregators/cubes');

function createServer(env, logger) {
  // Create static routes to some installed modules
  app.use('/bootstrap', express.static(join(__dirname, '../../node_modules/bootstrap/dist')));
  app.use('/jquery', express.static(join(__dirname, '../../node_modules/jquery/dist')));
  app.use('/popperjs', express.static(join(__dirname, '../../node_modules/popper.js/dist')));

  // Create static routes public folder
  //app.use('/public', express.static(join(__dirname, '..', 'public'), { maxAge: 86400000 }));

  // Set the view engine to pug
  app.set('view engine', 'pug');

  // Set the views folder to src/server/apps. This is now the starting path for .pug files.
  app.set('views', join(__dirname, 'apps'));

  // Use middleware
  app.use(loggerMiddleware(logger));
  app.use(errorHandlerMiddleware);
  app.use(cookieSession({ keys: [env.cookieSecret] }));
  app.use(prepRequestContextMiddleware);
  app.use(attachLocalsMiddleware);

  // Start the server
  async function start() {
    const messageStore = await crateMongodbMessageStore(env.mongoUriMessageStore);
    const mongooseConnection = await mongoose.createConnection(env.mongoUriDb, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });

    const User = createUser(mongooseConnection);
    const Cube = createCube(mongooseConnection);

    // Applications - These handle user requests and responds with user views,
    // they usually create commands but can also generate events directly.
    const homeApp = createHomeApp(logger, { User });
    const registerUsersApp = createRegisterUsersApp(logger, messageStore, { User });
    const authenticateUsersApp = createAuthenticateUsersApp(logger, messageStore, { User });
    const createCubesApp = createCreateCubesApp(logger, messageStore, { Cube });
    const listCubesApp = createListCubesApp(logger, { Cube });
    const handleCubeApp = createHandleCubeApp(logger, messageStore, { Cube });

    // Components - These handle command streams and genereate events
    const identityComponent = createIdentityComponent(logger, messageStore);
    const cubesComponent = createCubesComponent(logger, messageStore);

    // Aggregators - These aggregate event streams into user views
    const userCredentialsAggregator = createUserCredentialsAggregator(logger, messageStore, { User });
    const cubesAggregator = createCubesAggregator(logger, messageStore, { Cube });

    // Add routes for all the applications
    app.use('/', homeApp.router);
    app.use('/register', registerUsersApp.router);
    app.use('/auth', authenticateUsersApp.router);
    app.use('/cubes/create', createCubesApp.router);
    app.use('/cubes', listCubesApp.router);
    app.use('/cube', handleCubeApp.router);

    const port = env.port;

    // Start components
    identityComponent.start();
    cubesComponent.start();

    // Start aggregators
    userCredentialsAggregator.start();
    cubesAggregator.start();
    
    // Start the server
    app.listen(port);
    logger.info('Server - Started.', { port });

    // Emit an event so e2e test knows the express app has started
    app.emit('appStarted');
  }

  return {
    start,
    app, // This is exported for e2e test
  };
}

module.exports = createServer;
