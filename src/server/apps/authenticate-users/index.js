const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const express = require('express');
const uuid = require('uuid/v4');
const writeLoggedInEvent = require('./write-logged-in-event');

const AuthenticationError = require('./authentication-error');

function createActions(logger, messageStore, { User }) {
  async function authenticateUser({ traceId, username, password }) {
    const userCredential = await User.findOne({ username }).exec();
    if (!userCredential) {
      throw new AuthenticationError('User not found');
    }

    const matched = await bcrypt.compare(password, userCredential.passwordHash);
    if (!matched) {
      throw new AuthenticationError('Wrong password!');
    }

    // All is fine, log in user.
    await writeLoggedInEvent(logger, messageStore, { traceId, userId: userCredential.userId });

    return userCredential;
  }

  return { authenticateUser };
}

function createHandlers(actions) {
  async function handleAuthenticateUser(req, res, next) {
    const {
      body: { username, password },
      context: { traceId },
    } = req;

    try {
      const userCredential = await actions.authenticateUser({ traceId, username, password });
      // Logged in, set session userId (it will be kept by 'cookie-session').
      req.session.userId = userCredential.userId;

      // After log-in, redirect to home page.
      res.redirect('/');
    } catch (err) {
      if (err instanceof AuthenticationError) {
        // Can't log in, show the form again with error
        res.status(401).render('authenticate-users/templates/login-form', { errors: true });
      } else {
        next(err);
      }
    }
  }

  function handleLogOut(req, res) {
    req.session = null;
    res.redirect('/');
  }

  function handleShowLoginForm(req, res) {
    res.render('authenticate-users/templates/login-form');
  }

  return { handleAuthenticateUser, handleLogOut, handleShowLoginForm };
}

function createAuthenticateUsersApp(logger, messageStore, { User }) {
  const actions = createActions(logger, messageStore, { User });
  const handlers = createHandlers(actions);

  const router = express.Router();

  router
    .route('/log-in')
    .get(handlers.handleShowLoginForm)
    .post(bodyParser.urlencoded({ extended: false }), asyncHandler(handlers.handleAuthenticateUser));

  router.route('/log-out').get(handlers.handleLogOut);

  return { actions, handlers, router };
}

module.exports = createAuthenticateUsersApp;
