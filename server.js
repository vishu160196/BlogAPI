var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

var app=express();
var secret=crypto.randomBytes(32).toString();

exports.crypto=crypto
exports.secret=secret;
exports.jwt=jwt

app.use(morgan('combined'));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jwt.verify(req.headers.authorization.split(' ')[1], secret, function(err, decode) {
      if (err) req.user = undefined;
      else req.user = decode;
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80

var routes = require('./routes');
routes(app);

app.use(function(req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found' })
});

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});