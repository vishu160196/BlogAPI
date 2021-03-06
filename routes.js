'use strict';

module.exports = function(app) {

    var applicationControl = require('./appcontroller'), /* module to manage user activities like retrieving feed, 
                                                                publishing blogs*/

    userHandlers = require('./usercontroller'); /* module to manage user authentication, registration, existence of a 
    user */

    // routes

    app.route('/test-heroku').get(function(req, res){
        res.send('working')
    })

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