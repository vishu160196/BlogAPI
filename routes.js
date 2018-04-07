'use strict';

module.exports = function(app) {

    var applicationControl = require('./appcontroller'), /* module to manage user activities like retrieving feed, 
                                                                publishing blogs*/

    userHandlers = require('./usercontroller'); /* module to manage user authentication, registration, existence of a 
    user */

    var mongodb = require('mongodb')
    var mongoclient = mongodb.MongoClient
    var url = 'mongodb://vishu160196:Y%40nkeeD00dle@ds237489.mlab.com:37489/user'

    
    //var models = require('./models')(mongoose)

    app.route('/get-all').get(function(req, res){
        mongoclient.connect(url, {uri_decode_auth : true}, function(err, db){
            //db=client.db('user')
            coll=db.collection('users')
            coll.find({}).toArray(function(err, docs){
                console.log(docs)
            })
        })
    })

    // routes
    app.route('/login')
        .post(userHandlers.login);

	app.route('/register')
        .post(userHandlers.register);
        
    app.route('/blogpost')
        .post(userHandlers.loginRequired, applicationControl.publishPost);

    app.route('/follow/:username')
        .put(userHandlers.loginRequired, applicationControl.follow)

    app.route('/feed')
        .get(userHandlers.loginRequired, applicationControl.getFeed);
    
    /* This is a utility API that returns whether a client is signed in or not  */
    app.route('/login-check')
        .get(userHandlers.loginCheck);
};