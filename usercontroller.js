'use strict'

var jwt=require('./server').jwt;
var secret=require('./server').secret;
var crypto=require('./server').crypto;
var mongoclient=require('./server').mongoclient
var url=require('./server').url
var models = require('./models')

function hash(userPassword, salt) {
    var hashedPassword;

    hashedPassword = crypto.pbkdf2Sync(userPassword, salt, 100000, 512, 'sha512').toString('hex');

    return ['pbkdf2Sync', salt, hashedPassword].join('#');
}

exports.register = function(req, res) {

    //extract username and password sent by the user from message body
    var username = req.body.username;
    var password = req.body.password;
    var salt = crypto.randomBytes(256).toString('hex');

    password = hash(password, salt);
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;

    var user = new models.User(username, password, firstname, lastname)
    // create a new entry in users collection
    mongoclient.connect(url, {uri_decode_auth : true}, function(err, db){
        if(!err){
            db=db.db('user')
            db.collection('users', function(err, collection){
                if (err)
                    res.status(500).send(JSON.stringify({error:err.toString()}));
                else{
                    collection.insertOne(user, function(err, result){
                        if(err){
                            res.statusMessage='Internal server error'
                            res.status(500).send(JSON.stringify({error : err.errmsg}))
                        }
                        else{
                            res.statusMessage='Created'
                            res.status(201).send(JSON.stringify({message: 'user created succesfully'}))
                        }
                    })
                }
            })
        }else{
            res.statusMessage='Internal server error'
            res.status(500).send(JSON.stringify({error: 'Unable to connect to database'}))
        }
    })
};

exports.login=function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    //create a token only if user is not logged in
    if(!req.user){

        mongoclient.connect(url, {uri_decode_auth : true}, function(err, db){
            if(!err){
                db=db.db('user')
                db.collection('users').findOne({username : username}, {password : true}, function(err, doc){
                    if(!doc){
                        res.statusMessage='Unauthorized'
                        res.status(401).send(JSON.stringify({error:'no user with this name exists'}))
                    }
                    else{
                        
                        if(doc.password!=hash(password, doc.password.split('#')[1])){
                            res.statusMessage='Forbidden'
                            res.status(403).send(JSON.stringify({error:'incorrect password'}))
                        }
        
                        else{
                            res.statusMessage='OK'                    
                            res.status(200).send(JSON.stringify({ token: jwt.sign({username:username}, secret), message : `logged in as ${username}` }))
                        }
                    }
                })
            }else{
                res.statusMessage='Internal server error'
                res.status(500).send(JSON.stringify({error: 'Unable to connect to database'}))
            }
            
        })
    }

    else{
        res.status(403).send(JSON.stringify({message:`You are already logged in as ${req.user.username} first logout then try logging in again`}));
    }
};

exports.loginCheck=function(req, res){
    if(req.user)
        res.status(200).send(JSON.stringify(req.user));
    else {
        res.status(401).send(JSON.stringify({error:'you are not logged in'}));
    }
};

exports.loginRequired = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.statusMessage='Unauthorized';
    res.status(401).send(JSON.stringify({ error: 'you are not logged in' }));
  }
};