const uuid = require('uuid/v4')

function writeMovesRejectedEvent (logger, messageStore, {traceId, userId, cubeId, moves, message}) {

  const event = {
    id: uuid(),
    type: 'MovesRejected',
    metadata: {
      traceId: traceId,
      userId: userId
    },
    data: {
      cubeId,
      moves,
      message
    }
  }
  const streamName = `cubes-${cubeId}`

  logger.info('component.cubes - Writing moves rejected event', {streamName, event});

  messageStore.writer.write(streamName, event);
}

module.exports = writeMovesRejectedEvent
