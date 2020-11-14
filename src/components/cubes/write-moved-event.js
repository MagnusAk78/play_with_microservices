const uuid = require('uuid/v4')

function writeMovedEvent (logger, messageStore, {traceId, userId, cubeId, cube, moves, solved, solution}) {

  const event = {
    id: uuid(),
    type: 'Moved',
    metadata: {
      traceId: traceId,
      userId: userId
    },
    data: {
      cubeId,
      cube,
      moves,
      solved,
      solution
    }
  }
  const streamName = `cubes-${cubeId}`

  logger.info('component.cubes - Writing moved event', {streamName, event});

  messageStore.writer.write(streamName, event);
}

module.exports = writeMovedEvent
