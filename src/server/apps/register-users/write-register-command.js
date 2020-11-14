const uuid = require('uuid/v4');

function writeRegisterCommand(logger, messageStore, { traceId, userId, username, passwordHash }) {
  const streamName = `identity:command-${userId}`;
  const commandMessage = {
    id: uuid(),
    type: 'Register',
    metadata: {
      traceId: traceId,
      userId,
    },
    data: {
      userId,
      username,
      passwordHash,
    },
  };

  logger.debug('application.register-users - Writing register command.', { commandMessage });

  messageStore.writer.write(streamName, commandMessage);
}

module.exports = writeRegisterCommand;
