const { Client } = require('@elastic/elasticsearch')

const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const fs = require('fs')
const writeError = require('./helper/helper').writeError

// security header and compression
const compression = require('compression')
const helmet = require('helmet')

// environment configurations
const dotenv = require('dotenv')
dotenv.config({ path: `config/.env.${process.env.NODE_ENV}` })

const bookRouter = require('./routes/routes');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());

// ES client configuration
const client = new Client({
  node: process.env.ES_HOST,
  auth: {
    apiKey: process.env.API_KEY
  },
  ssl: {
    ca: [fs.readFileSync(process.env.CA_CERT)], // to read CA certificate
    rejectUnauthorized: true
  }
})

app.set('client', client);
app.use('/books', bookRouter);

// Route not found (404)
app.use(function (req, res, next) {
  if (req.route === undefined) {
    res.status(404).send({ message: 'Route' + req.url + ' Not found.' })
  }
  next()
})

// error handler
app.use(function (err, req, res, next) {
  if (err) {
    writeError(req.log, res, err, err.status)
    next()
  } else {
    next(err)
  }
})

module.exports = app;
