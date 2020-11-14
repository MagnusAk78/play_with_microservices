const express = require('express');

const asyncHandler = require('express-async-handler');

function createListCubesApp(logger, { Cube }) {

  function createHandlers({ Cube }) {

    async function handleListCubes(req, res, next) {
      if (req.context.userId) {
        // Logged in, show users cubes
        try {
          const cubes = await Cube.find({ userId: req.context.userId });
          logger.debug('application.handleListCubes', {cubes});
          res.render('list-cubes/templates/list', { cubes })
        }
        catch(error) {
          logger.error('application.list-cubes - handleListCubes.', {error});
          next(error);
        }
      } else {
        // Not logged in, redirect to root
        res.redirect('/')
      }
    }
  
    return {
      handleListCubes
    };
  }

  const handlers = createHandlers({ Cube });

  const router = express.Router();

  router
    .route('/')
    .get(asyncHandler(handlers.handleListCubes));

  return {
    router,
  };
}

module.exports = createListCubesApp;
