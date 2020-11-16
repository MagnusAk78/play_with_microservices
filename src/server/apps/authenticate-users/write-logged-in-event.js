const uuid = require('uuid/v4');

function writeLoggedInEvent(logger, messageStore, { traceId, userId }) {
  const event = {
    id: uuid(),
    type: 'UserLoggedIn',
    metadata: {
      traceId,
      userId,
    },
    data: { userId },
  };
  const streamName = `authentication-${userId}`;

  logger.debug('application.authenticateUsers - Writing logged in event.', { streamName, event });

  return messageStore.writer.write(streamName, event);
}

module.exports = writeLoggedInEvent;
