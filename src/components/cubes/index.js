const writeCreatedEvent = require('./write-created-event');
const writeMovedEvent = require('./write-moved-event');
const writeMovesRejectedEvent = require('./write-moves-rejected-event');
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

        const currentCube = loadedCube.arrayOfMoves[loadedCube.arrayOfMoves.length - 1].cube;

        //Get current cube from loaded cube
        const currentCubeObj = cubejs.fromString(currentCube);

        logger.debug('components.cubes - do moves. ', { currentCube, currentCubeObj });

        let cubeObj = null;
        try {
          cubeObj = currentCubeObj.move(moves);
        } catch (err) {
          // Invalid move
        }

        if (cubeObj) {
          const cube = cubeObj.asString();

          const solved = cubeObj.isSolved();
          let solution = '';
          if (!solved) {
            cubejs.initSolver();
            solution = cubeObj.solve();
          }

          await writeMovedEvent(logger, messageStore, { traceId, userId, cubeId, cube, moves, solved, solution });
        } else {
          const message = 'Invalid moves';
          await writeMovesRejectedEvent(logger, messageStore, { traceId, userId, cubeId, moves, message });
        }
      } else {
        logger.info('components.cubes - do moves. Cube already solved.', command);
        const message = 'Cube already solved';
        await writeMovesRejectedEvent(logger, messageStore, { traceId, userId, cubeId, moves, message });
      }
    },
  };
}

function createCubesComponent(logger, messageStore) {
  const cubesCommandHandlers = createCubesCommandHandlers(logger, messageStore);
  const cubesCommandSubscription = messageStore.subscriptionHandler.createSubscription(
    'cubes:command',
    cubesCommandHandlers,
    'component:cubes:command'
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
