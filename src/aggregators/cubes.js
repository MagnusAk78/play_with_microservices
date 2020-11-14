function createHandlers({ queries }) {
  return {
    Created: (cubeCreatedEvent) => queries.createCube(cubeCreatedEvent),
    Moved: (cubeMovedEvent) => queries.updateCube(cubeMovedEvent),
    Solved: (cubeSolvedEvent) => queries.cubeSolved(cubeSolvedEvent),
  };
}

function createQueries(logger, { Cube }) {
  async function createCube(cubeCreatedEvent) {
    logger.debug('aggregator.cubes - Created event received');
    const cube = await Cube.findOne({ cubeId: cubeCreatedEvent.data.cubeId });
    if (!cube) {
      const newCube = new Cube({
        cubeId: cubeCreatedEvent.data.cubeId,
        userId: cubeCreatedEvent.metadata.userId,
        name: cubeCreatedEvent.data.name,
        arrayOfMoves: [
          {
            moves: '',
            cube: cubeCreatedEvent.data.cube,
            solution: cubeCreatedEvent.data.solution,
            traceId: cubeCreatedEvent.metadata.traceId,
          },
        ],
        globalPosition: cubeCreatedEvent.globalPosition,
        solved: false
      });
      await newCube.save();
    } else {
      logger.debug('aggregator.cubes - Cube already exist, ignoring.', { cubeId: cubeCreatedEvent.data.cubeId, name: cubeCreatedEvent.data.name });
    }
  }

  async function updateCube(cubeMovedEvent) {
    logger.debug('aggregator.cubes - Moved event received');
    const query = { cubeId: cubeMovedEvent.data.cubeId };

    const oldCube = await Cube.findOne(query);
    if (oldCube && cubeMovedEvent.globalPosition > oldCube.globalPosition) {
      const updateDoc = {
        $push: {
          arrayOfMoves: {
            moves: cubeMovedEvent.data.moves,
            cube: cubeMovedEvent.data.cube,
            solution: cubeMovedEvent.data.solution,
            traceId: cubeMovedEvent.metadata.traceId,
          },
        },
        $set: {
          globalPosition: cubeMovedEvent.globalPosition,
        },
      };
      const updateResult = await Cube.updateOne(query, updateDoc);
      logger.info('aggregators.cubes => Moved event update', {updateResult});
    } else {
      logger.info('aggregators.cubes => Moved event already handled, do nothing');
    }
  }

  async function cubeSolved(cubeSolvedEvent) {
    logger.debug('aggregator.cubes - Solved event received');
    const query = { cubeId: cubeSolvedEvent.data.cubeId };

    const cube = await Cube.findOne(query);
    if (cube && cubeSolvedEvent.globalPosition > cube.globalPosition) {
      const updateDoc = {
        $set: {
          solved: true,
          globalPosition: cubeSolvedEvent.globalPosition,
        },
      };
      const updateResult = await Cube.updateOne(query, updateDoc);
      logger.info('aggregators.cubes => Solved event update', {updateResult});
    } else {
      logger.info('aggregators.cubes => Solved event already handled, do nothing');
    }
  }

  return {
    createCube,
    updateCube,
    cubeSolved,
  };
}

/**
 * Creates the aggregator that handles cubes.
 * @param {Object} logger           logger
 * @param {Object} messageStore     messageStore (from mongodb-message-store)
 * @param {Object} Options
 * @param {Object} Options.Cube     Mongoose Cube object model
 */
function createCubesAggregator(logger, messageStore, { Cube }) {
  const queries = createQueries(logger, { Cube });
  const handlers = createHandlers({ queries });

  const subscription = messageStore.subscriptionHandler.createSubscription('cubes', handlers, 'aggregators:cubes');

  function start() {
    subscription.start();
    logger.info('aggregator.cubes - Started');
  }

  return {
    start,
  };
}

module.exports = createCubesAggregator;
