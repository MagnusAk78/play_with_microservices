const morgan = require('morgan');

function loggerMiddleware(logger) {
  const morganLogStream = {
    write: function (text) {
      logger.info(text);
    },
  };

  return morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganLogStream });
}

module.exports = loggerMiddleware;
