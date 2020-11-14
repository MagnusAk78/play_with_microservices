const dotenv = require('dotenv');

function getEnvValue(key, injectedValues) {
  if (injectedValues && injectedValues[key]) {
    return injectedValues[key];
  } else {
    const value = process.env[key];
    if (!value) {
      console.error('Missing env variable: %s', key);
      process.exit(1);
    }
    return value;
  }
}

function createEnv(injectedValues) {
  const envResult = dotenv.config();

  if (envResult.error) {
    console.error('env failed to load');
    process.exit(1);
  }

  return {
    logLevel: getEnvValue('LOG_LEVEL', injectedValues),
    mongoUriDb: getEnvValue('MONGO_URI_DB', injectedValues),
    mongoUriMessageStore: getEnvValue('MONGO_URI_MESSAGE_STORE', injectedValues),
    cookieSecret: getEnvValue('COOKIE_SECRET', injectedValues),
    port: getEnvValue('PORT', injectedValues),
  };
}

module.exports = createEnv;
