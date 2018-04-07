var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');

var app=express();
var secret=crypto.randomBytes(32).toString(); // secret string to be used for signing JWTs

exports.crypto=crypto
exports.secret=secret;
exports.jwt=jwt

app.use(morgan('combined')); // server logs
app.use(bodyParser.json());  // parse requests as JSON serializable objects

app.use(function(req, res, next) {
  if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
    jwt.verify(req.headers.authorization.split(' ')[1], secret, function(err, decode) {
      if (err) req.user = undefined; // requesting client not logged in
      else req.user = decode;        // requesting client has sent valid token
      next();
    });
  } else {
    req.user = undefined;
    next();
  }
});

var mongodb = require('mongodb') // native mongoDB driver for nodejs
var mongoclient = mongodb.MongoClient
var url = process.env.URL // obfuscation of database credentials from other developers

exports.mongoclient=mongoclient
exports.url=url

var port = process.env.PORT || 5000; // heroku provides dynamic ports through environment variables

var routes = require('./routes'); 
routes(app); // routes module sets gateways for different endpoints

app.use(function(req, res) {
  res.status(404).send({ url: req.originalUrl + ' not found' }) // in case of requesting a url having no handler
});

app.listen(port, function () {
    console.log(`App listening on port ${port}!`);
});