const writeRegisteredEvent = require('./write-registered-event');
const identityProjection = require('./identity-projection');

function createIdentityCommandHandlers(logger, messageStore) {
  return {
    Register: async (command) => {
      logger.debug('component.identity - Register command received', { command });
      const identityStreamName = `identity-${command.data.userId}`;
      const identity = await messageStore.reader.loadEntity(identityStreamName, identityProjection);
      if (identity.isRegistered) {
        // Already registered, do not register again
        logger.debug('component.identity - Register command of already registered user, ignoring.', { command });
      } else {
        writeRegisteredEvent(logger, messageStore, { command });
      }
    },
  };
}

function createIdentityComponent(logger, messageStore) {
  const identityCommandHandlers = createIdentityCommandHandlers(logger, messageStore);

  // Identity component subscribes to identity commands.
  const identityCommandSubscription = messageStore.subscriptionHandler.createSubscription(
    'identity:command',
    identityCommandHandlers,
    'component:identity:command'
  );

  function start() {
    // Start the subscription
    identityCommandSubscription.start();
    logger.info('component.identity - Started');
  }

  return {
    start,
  };
}

module.exports = createIdentityComponent;
