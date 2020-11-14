const uuid = require('uuid/v4');

function writeDoMovesCommand(logger, messageStore, { traceId, userId, cubeId, moves }) {
  const streamName = `cubes:command-${cubeId}`;
  const command = {
    id: uuid(),
    type: 'DoMoves',
    metadata: {
      traceId,
      userId,
    },
    data: {
      cubeId,
      moves,
    },
  };

  logger.debug('application.handle-cube - Writing do-moves command.', { streamName, command });

  messageStore.writer.write(streamName, command);
}

module.exports = writeDoMovesCommand;
