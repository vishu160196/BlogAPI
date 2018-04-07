'use strict';

module.exports = function(app) {

    var applicationControl = require('./appcontroller'), /* module to manage user activities like retrieving feed, 
                                                                publishing blogs*/

    userHandlers = require('./usercontroller'); /* module to manage user authentication, registration, existence of a 
    user */

    

    
    //var models = require('./models')(mongoose)

    // app.route('/get-all').get(function(req, res){
    //     mongoclient.connect(url, {uri_decode_auth : true}, function(err, db){
    //         db=db.db('user')
    //         db.collection('users').find().toArray(function(err, items){
    //             console.log(items)
    //         })
    //     })
    // })

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