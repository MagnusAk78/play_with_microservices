const uuid = require('uuid/v4');

function writeRegisteredEvent(logger, messageStore, { command }) {
  const event = {
    id: uuid(),
    type: 'Registered',
    metadata: {
      traceId: command.metadata.traceId,
      userId: command.metadata.userId,
    },
    data: {
      userId: command.data.userId,
      username: command.data.username,
      passwordHash: command.data.passwordHash,
    },
  };
  const streamName = `identity-${command.data.userId}`;

  logger.debug('component.identity - Writing registered event.', {streamName, event});

  messageStore.writer.write(streamName, event);
}

module.exports = writeRegisteredEvent;
