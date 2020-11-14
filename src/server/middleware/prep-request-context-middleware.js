const uuid = require('uuid/v4');

// This middleware adds a traceId to all the requests so they can be traced through
// the commands and events connected to specific request. It also adds the userId
// to context if the session includes it e.g. a user has logged in.
function prepRequestContextMiddleware(req, res, next) {
  req.context = {
    traceId: uuid(),
    userId: req.session ? req.session.userId : null,
  };

  next();
}

module.exports = prepRequestContextMiddleware;
