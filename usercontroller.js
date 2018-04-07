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
        db=db.db('user')
        db.collection('users', function(err, collection){
            if (err)
                res.status(500).send(JSON.stringify({message:err.toString()}));
            else{
                collection.insertOne(user, function(err, result){
                    console.log(err)
                    console.log(result)
                })
            }
        })
    })

    // pool.query("insert into user_info(name,username,password,email) values($1, $2, $3, $4);", [name, userName, userPassword, email], function (err, result) {
    //     if (err)
    //         res.status(500).send(JSON.stringify({message:err.toString()}));

    //     else
    //         res.status(200).send(JSON.stringify({message:'User created successfully please login to continue'}));
    // });
};

exports.login=function(req, res){
    var username = req.body.username;
    var password = req.body.password;

    //start a session only if there is no earlier session
    if(!req.user){
        pool.query("SELECT * FROM user_info WHERE username = $1", [userName], function (err, result){
           if (err)
            res.status(500).send(JSON.stringify({message:err.toString()}));

           else {
            if (result.rows.length === 0)
                res.status(404).send(JSON.stringify({message:'Username not found'}));

            else {
                var actualPassPhrase = result.rows[0].password;
                var salt = actualPassPhrase.split('#')[1];

                userPassword = hash(userPassword, salt);

                if (userPassword === actualPassPhrase)
                {
                    var user={
                        username:result.rows[0].username,
                        id:result.rows[0].id
                    };

                    return res.json({ token: jwt.sign(user, secret), id : user.id });
                }

                else
                    res.status(401).send(JSON.stringify({message:'Incorrect password'}));
        }
        }
        });
    }

    else{
        res.status(403).send(JSON.stringify({message:`You are already logged in as ${req.user.username} first logout then try logging in again`}));
    }
};

exports.loginCheck=function(req, res){
    if(req.user)
        res.status(200).send(JSON.stringify(req.user));
    else {
        res.status(200).send(JSON.stringify({error:'you are not logged in'}));
    }
};


exports.loginRequired = function(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.statusMessage='Unauthorized';
    res.status(401).send(JSON.stringify({ error: 'Unauthorized user!' }));
  }
};

exports.userExists=function (req, res) {
    var username=req.query.username;

    pool.query("select username, id from user_info where username= $1;", [username], function (err, result) {

        if (err||result.rows.length===0) {
            if(err){
                res.status(500).send(JSON.stringify({message:err.toString()}));
            }
            else{
                res.status(500).send(JSON.stringify({message:'user does not exist'}));
            }
        }

        else {

            res.status(200).send(JSON.stringify({exists:true, id:result.rows[0].id}));
        }
    });
};