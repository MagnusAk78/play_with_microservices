const bodyParser = require('body-parser');
const express = require('express');

const ValidationError = require('../../errors/validation-error');
const writeCreateCommand = require('./write-create-command');
const asyncHandler = require('express-async-handler');
const uuid = require('uuid/v4');

function createCreateCubeApp(logger, messageStore, { Cube }) {
  function createActions(messageStore, { Cube }) {
    async function createCube({ traceId, cubeId, name, userId }) {
      const existingIdentity = await Cube.findOne({ name, userId });

      if (existingIdentity) {
        logger.debug('application.create-cube - Creation of already taken cube name.', { name });
        throw new ValidationError({ name: ['already taken'] });
      } else {
        writeCreateCommand(logger, messageStore, { traceId, cubeId, name, userId });
      }
    }

    return {
      createCube,
    };
  }

  function createHandlers(actions) {
    function handleCreateForm(req, res) {
      res.render('create-cubes/templates/create', { cubeId: uuid() });
    }

    async function handleCreateCube(req, res, next) {
      const attributes = {
        traceId: req.context.traceId,
        cubeId: req.body.cubeId,
        name: req.body.name,
        userId: req.context.userId
      };

      logger.debug('application.create-cubes - handleCreateCube', {attributes, req_body: req.body});

      try {
        await actions.createCube(attributes);
        res.redirect(301, '/cube/' + req.body.cubeId + '/' + req.context.traceId);
      } catch (err) {
        if (err instanceof ValidationError) {
          res.status(400).render('create-cubes/templates/create', { cubeId: attributes.cubeId, 
            errors: err.errors });
        } else {
          next(err);
        }
      }
    }

    return {
      handleCreateForm,
      handleCreateCube,
    };
  }

  const actions = createActions(messageStore, { Cube });
  const handlers = createHandlers(actions);

  const router = express.Router();

  router
    .route('/')
    .get(handlers.handleCreateForm)
    .post(bodyParser.urlencoded({ extended: false }), asyncHandler(handlers.handleCreateCube));

  return {
    router,
  };
}

module.exports = createCreateCubeApp;
