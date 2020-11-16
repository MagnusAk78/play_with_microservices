function createHandlers({ queries }) {
  return {
    Registered: (event) =>
      queries.createUserCredential({
        userId: event.data.userId,
        username: event.data.username,
        passwordHash: event.data.passwordHash,
      }),
  };
}

function createQueries(logger, { User }) {
  async function createUserCredential({ userId, username, passwordHash }) {
    logger.debug('aggregator.userCredentials - Registered event received');
    const existingUser = await User.findOne({ username }).exec();
    if (existingUser) {
      logger.debug('aggregator:userCredentials - User already exist, ignoring.', { username });
    } else {
      const user = new User({
        username,
        userId,
        passwordHash,
      });
      await user.save();
    }
  }

  return {
    createUserCredential,
  };
}

/**
 * Creates the aggregator that handles users credentials.
 * @param {Object} logger           logger
 * @param {Object} messageStore     messageStore (from mongodb-message-store)
 * @param {Object} Options
 * @param {Object} Options.User     Mongoose User object model
 */
function createUserCredentialsAggregator(logger, messageStore, { User }) {
  const queries = createQueries(logger, { User });
  const handlers = createHandlers({ queries });
  const subscription = messageStore.subscriptionHandler.createSubscription(
    'identity',
    handlers,
    'aggregator:userCredentials'
  );

  function start() {
    subscription.start();
    logger.info('aggregator.userCredentials - Started');
  }

  return {
    start,
  };
}

module.exports = createUserCredentialsAggregator;
