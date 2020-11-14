const createEnv = require('./env');
const createLogger = require('./logger');
const createServer = require('./server');

function createSystem() {
  const env = createEnv();
  const logger = createLogger(env);
  const server = createServer(env, logger);

  function start() {
    server.start();
  }

  return {
    start
  }
}

module.exports = createSystem