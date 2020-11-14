const uuid = require('uuid/v4')

function writeCreatedEvent (logger, messageStore, {traceId, userId, cubeId, cube, name, solution}) {
  const event = {
    // ...
    id: uuid(),
    type: 'Created',
    metadata: {
      traceId: traceId,
      userId: userId
    },
    data: {
      cubeId: cubeId,
      userId: userId,
      cube: cube,
      name: name,
      solution: solution
    }
  }
  const streamName = `cubes-${cubeId}`;

  logger.info('component.cubes - Writing created event', {streamName, event});

  messageStore.writer.write(streamName, event);
}

module.exports = writeCreatedEvent
