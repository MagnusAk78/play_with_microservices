const uuid = require('uuid/v4');

function writeCreateCommand(logger, messageStore, { traceId, cubeId, name, userId }) {
  const streamName = `cubes:command-${cubeId}`;
  const command = {
    id: uuid(),
    type: 'Create',
    metadata: {
      traceId,
      userId,
    },
    data: {
      cubeId,
      userId,
      name,
    },
  };

  logger.debug('application.register-users - Writing create command.', { streamName, command });

  messageStore.writer.write(streamName, command);
}

module.exports = writeCreateCommand;
