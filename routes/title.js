const _ = require('lodash');
const writeResponse = require('../helper/helper').writeResponse;
const errorHandler = require('../helper/helper').errorHandler;
const parseBody = require('../helper/helper').parseBody;
const parseTotalHits = require('../helper/helper').parseTotalHits;

exports.searchTitle = async function(req, res, next) {
  try {
    const payload = {
      index: process.env.ES_CONTRACT_INDEX,
      body: {
        "query": {
          "bool": {
            "must": [{
              "query_string": {
                "default_field": "title",
                "query": req.query.keyword || '*'
              }
            }]
          }
        }
      }
    }

    const from = req.query.from || 0
    const size = req.query.size || 10

    _.assign(payload, { from: from, size: size })

    // Let's search!
    const client = req.app.get('client')
    const { body } = await client.search(payload)

    var results = {
      content: parseBody(body)
        .map(function (i) { return _.omit(i._source, 'attEventDate') })
    }

    var totalResults = {
      total: {
        value: parseTotalHits(body).value,
        relation: parseTotalHits(body).relation
      }
    }

    writeResponse(res, _.assign(totalResults, results))
    next()
  } catch (err) {
    errorHandler(req.originalUrl, err.message, next, 500)
  }
};
