const bodyParser = require('body-parser');
const express = require('express');

const ValidationError = require('../../errors/validation-error');
const writeDoMovesCommand = require('./write-do-moves-command');
const asyncHandler = require('express-async-handler');

function createHandlers(logger, messageStore, { Cube }) {
  async function handleShowCube(req, res, next) {
    if (req.context.userId) {
      // User logged in
      try {
        const cube = await Cube.findOne({ cubeId: req.params.cubeId });

        let shouldReload = true;
        if(req.params.traceId) {
          if(cube) {
            cube.arrayOfMoves.forEach((element) => {
              if (element.traceId == req.params.traceId) {
                shouldReload = false;
              }
            });
          }
        } else {
          shouldReload = false;
        }

        logger.debug('application.handle-cube - Show cube', {cube, traceId: req.params.traceId, shouldReload});

        res.render('handle-cube/templates/show-cube', { cube, shouldReload });
      } catch (error) {
        next(error);
      }
    } else {
      // No user is logged in, redirect to home
      res.redirect('/');
    }
  }

  async function handleDoMoves(req, res, next) {
    if (req.context.userId) {
      // User logged in
      try {
        const { traceId, userId, cubeId, moves } = {
          cubeId: req.body.cubeId,
          moves: req.body.moves,
          traceId: req.context.traceId,
          userId: req.context.userId,
        };

        await writeDoMovesCommand(logger, messageStore, { traceId, userId, cubeId, moves });
        res.redirect(`/cube/${req.body.cubeId}/${req.context.traceId}`);
      } catch (error) {
        next(error);
      }
    } else {
      // No user is logged in, redirect to home
      res.redirect('/');
    }
  }

  return {
    handleShowCube,
    handleDoMoves,
  };
}

function createHandleCubeApp(logger, messageStore, { Cube }) {
  const handlers = createHandlers(logger, messageStore, { Cube });

  const router = express.Router();

  router
    .route('/:cubeId')
    .get(asyncHandler(handlers.handleShowCube))
    .post(bodyParser.urlencoded({ extended: false }), handlers.handleDoMoves);

  router.route('/:cubeId/:traceId').get(asyncHandler(handlers.handleShowCube));

  return {
    router,
  };
}

module.exports = createHandleCubeApp;
