const bodyParser = require('body-parser');
const express = require('express');

const ValidationError = require('../../errors/validation-error');
const writeRegisterCommand = require('./write-register-command');
const hashPassword = require('./hash-password');
const asyncHandler = require('express-async-handler');
const uuid = require('uuid/v4');

function createRegisterUsersApp(logger, messageStore, { User }) {
  function createActions(messageStore, { User }) {
    async function registerUser({ traceId, userId, username, password }) {
      const existingIdentity = await User.findOne({ username });

      if (existingIdentity) {
        logger.debug('application.register-users - Registration of already taken username.', { username });
        throw new ValidationError({ username: ['already taken'] });
      } else {
        const passwordHash = await hashPassword(password);
        writeRegisterCommand(logger, messageStore, { traceId, userId, username, passwordHash });
      }
    }

    return {
      registerUser,
    };
  }

  function createHandlers(actions) {
    function handleRegistrationForm(req, res) {
      res.render('register-users/templates/register', { userId: uuid() });
    }

    function handleRegistrationComplete(req, res) {
      res.render('register-users/templates/registration-command-sent');
    }

    async function handleRegisterUser(req, res, next) {
      const attributes = {
        traceId: req.context.traceId,
        userId: req.body.id,
        username: req.body.username,
        password: req.body.password,
      };

      try {
        await actions.registerUser(attributes);
        res.redirect(301, 'register/registration-complete');
      } catch (err) {
        if (err instanceof ValidationError) {
          res.status(400).render('register-users/templates/register', { userId: attributes.userId, 
            errors: err.errors });
        } else {
          next(err);
        }
      }
    }

    return {
      handleRegistrationForm,
      handleRegistrationComplete,
      handleRegisterUser,
    };
  }

  const actions = createActions(messageStore, { User });
  const handlers = createHandlers(actions);

  const router = express.Router();

  router
    .route('/')
    .get(handlers.handleRegistrationForm)
    .post(bodyParser.urlencoded({ extended: false }), asyncHandler(handlers.handleRegisterUser));

  router.route('/registration-complete').get(handlers.handleRegistrationComplete);

  return {
    router,
  };
}

module.exports = createRegisterUsersApp;
