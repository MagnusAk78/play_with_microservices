function errorHandlerMiddleware (err, req, res, next) {
  const traceId = req.context ? req.context.traceId : 'none'

  res.status(500).send('error, traceId: %s, err: %j', traceId, err);
};

module.exports = errorHandlerMiddleware;