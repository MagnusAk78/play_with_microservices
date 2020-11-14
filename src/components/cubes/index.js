const writeCreatedEvent = require('./write-created-event');
const writeMovedEvent = require('./write-moved-event');
const writeSolvedEvent = require('./write-solved-event');
const cubeProjection = require('./cube-projection');

const cubejs = require('cubejs');

function loadCube(messageStore, { cubeId }) {
  const streamName = `cubes-${cubeId}`;

  return messageStore.reader.loadEntity(streamName, cubeProjection);
}

function createCubesCommandHandlers(logger, messageStore) {
  return {
    Create: async (command) => {
      logger.debug('component.cubes - Create command received', { command });

      const cubeId = command.data.cubeId;

      const loadedCube = await loadCube(messageStore, { cubeId });

      if (!loadedCube.isCreated) {
        const cubeObj = cubejs.random();
        const cube = cubeObj.asString();
        const isSolved = cubeObj.isSolved();

        const attributes = {
          traceId: command.metadata.traceId,
          userId: command.metadata.userId,
          cubeId,
          cube,
          name: command.data.name,
          solution: '',
        };

        if (!isSolved) {
          cubejs.initSolver();
          attributes.solution = cubeObj.solve();
        }

        await writeCreatedEvent(logger, messageStore, attributes);
      } else {
        logger.debug('components.cubes - create cube, already created, ignore.', { cubeId });
      }
    },
    DoMoves: async (command) => {
      logger.debug('component.cubes - DoMoves command received', { command });
      const loadedCube = await loadCube(messageStore, { cubeId: command.data.cubeId });
      if (!loadedCube.isSolved) {
        const traceId = command.metadata.traceId;
        const userId = command.metadata.userId;
        const cubeId = command.data.cubeId;
        const moves = command.data.moves;

        //Get current cube from loaded cube
        const cube = cubejs.fromString(loadedCube.currentCube);

        const newCubeObj = cube.move(moves);
        const newCube = newCubeObj.asString();

        const attributes = {
          traceId,
          userId,
          cubeId,
          newCube,
          moves: command.data.moves,
          solution: '',
        };

        if (!newCubeObj.isSolved()) {
          cubejs.initSolver();
          attributes.solution = newCubeObj.solve();
        } else {
          writeSolvedEvent(logger, messageStore, { traceId, userId, cubeId });
        }

        await writeMovedEvent(logger, messageStore, attributes);
      } else {
        logger.info('components.cubes - do moves. Cube already solved, will not comply.', command);
      }
    },
  };
}

function createCubesComponent(logger, messageStore) {
  const cubesCommandHandlers = createCubesCommandHandlers(logger, messageStore);
  const cubesCommandSubscription = messageStore.subscriptionHandler.createSubscription(
    'cubes:command',
    cubesCommandHandlers,
    'components:cubes:command'
  );

  function start() {
    cubesCommandSubscription.start();
    logger.info('component.cubes - Started');
  }

  return {
    start,
  };
}

module.exports = createCubesComponent;
