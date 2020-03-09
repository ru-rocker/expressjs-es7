const _ = require('lodash');

exports.writeResponse = function writeResaponse (res, response, status) {
  res.status(status || 200).send(response);
};

exports.writeError = function writeError (log, res, error, status) {
  console.error({ error: error }, 'Something Wrong');
  res.status(status).send(JSON.stringify(_.omit(error, ['status', 'path'])));
};

exports.errorHandler = function (path, err, next, status) {
  const error = {
    path: path,
    message: err,
    status: status
  };
  next(error);
};

exports.parseBody = function (body) {
  return body.hits.hits;
};

exports.parseTotalHits = function (body) {
  return body.hits.total;
};
