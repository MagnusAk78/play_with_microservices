const uuid = require('uuid/v4');

function writeSolvedEvent(logger, messageStore, { traceId, userId, cubeId }) {
  const event = {
    id: uuid(),
    type: 'Solved',
    metadata: {
      traceId: traceId,
      userId: userId,
    },
    data: {
      cubeId: cubeId,
    },
  };

  const streamName = `cubes-${cubeId}`;

  logger.info('component.cubes - Writing solved event', { streamName, event });

  messageStore.writer.write(streamName, event);
}

module.exports = writeSolvedEvent;
