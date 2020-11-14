const test = require('ava');
const session = require('supertest-session');
const { MongoMemoryServer } = require('mongodb-memory-server');
const uuid = require('uuid/v4');
const util = require('util');
const winston = require('winston');

//Timout promise
const setTimeoutPromise = util.promisify(setTimeout);

// The app
const createEnv = require('../src/env');
const createLogger = require('../src/logger');
const createServer = require('../src/server');
const { response } = require('express');

const dataMongod = new MongoMemoryServer();
const messageStoreMongod = new MongoMemoryServer();

let logger = null;
let server = null;
let serverDone = false;
let testSession = null;

function waitForServerDone() {
  return new Promise(function (resolve, reject) {
    (function waitForFoo() {
      if (serverDone) return resolve();
      setTimeout(waitForFoo, 100);
    })();
  });
}

const waitTime = 500;

// Create server before all the tests
test.before(async () => {
  const mongoUriDb = await dataMongod.getUri();
  const mongoUriMessageStore = await messageStoreMongod.getUri();

  const injectedEnvValues = {
    MONGO_URI_DB: mongoUriDb,
    MONGO_URI_MESSAGE_STORE: mongoUriMessageStore,
  };
  env = createEnv(injectedEnvValues);
  logger = createLogger(env);
  server = createServer(env, logger);

  //App emits the event (appStarted) after setup, we need to listen for it here.
  server.app.on('appStarted', () => {
    serverDone = true;
  });

  //Start the server.
  server.start();

  //Now, wait for the server to be done with the setup.
  await waitForServerDone();
});

// Disconnect after allt he tests
test.after.always(async () => {
  dataMongod.stop();
  messageStoreMongod.stop();
});

test.beforeEach(async () => {
  logger.info('---------------------------------------------------------------');
  // Wait some between every test
  await setTimeoutPromise(waitTime);

  testSession = session(server.app);
});

/**
 * Test 1, Home page
 */
test.serial('Home page returns OK', async (t) => {
  const res = await testSession.get('/');
  t.is(res.status, 200);
});

/**
 * Register user
 */
test.serial('Register user', async (t) => {
  const res = await testSession
    .post('/register')
    .type('form')
    .send({ id: uuid(), username: 'testuser', password: 'testpassword' });
  t.is(res.status, 301);
});

/**
 * Register same user again
 */
test.serial('Register user again', async (t) => {
  const res1 = await testSession
    .post('/register')
    .type('form')
    .send({ id: uuid(), username: 'another-user', password: 'testpassword' });
  t.is(res1.status, 301);

  // Wait for the user registration
  await setTimeoutPromise(waitTime);

  const res2 = await testSession
    .post('/register')
    .type('form')
    .send({ id: uuid(), username: 'another-user', password: 'testpassword' });
  t.is(res2.status, 400);
});

/**
 * Log in
 */
test.serial('Log in', async (t) => {
  const res1 = await testSession
    .post('/register')
    .type('form')
    .send({ id: uuid(), username: 'loginuser', password: 'loginpassword' });
  t.is(res1.status, 301);

  // Wait for the user registration
  await setTimeoutPromise(waitTime);

  const res2 = await testSession
    .post('/auth/log-in')
    .type('form')
    .send({ username: 'loginuser', password: 'loginpassword' });
  t.is(res2.status, 302);

  // Wait for user login
  await setTimeoutPromise(waitTime);

  const res3 = await testSession.get('/');
  t.assert(res3.text.indexOf('loginuser') !== -1);
});
