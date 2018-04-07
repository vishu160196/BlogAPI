/**
 * This module provides handlers for all activities of a logged in user. These include
 * 1. Publishing a blog post
 * 2. Following another user
 * 3. Getting his blog feed 
 */

var mongoclient=require('./server').mongoclient
var url=require('./server').url
var models = require('./models')

exports.follow = function(req, res){
    var followed = req.params.username // extract relevant information
    var username=req.user.username     // from request
    if(followed.length===0){
        res.statusMessage='missing field values'
        res.status(500).send(JSON.stringify({error: 'one or more field values missing'}))
        return
    }

    // Connect to database
    mongoclient.connect(url, {uri_decode_auth : true}, function(err, db){
        if(!err){
            db=db.db('user')
            db.collection('users').findOne({username : username}, {following : true}, function(err, doc){
                if(doc.following.includes(followed)){
                    res.statusMessage='No content'
                    res.status(204).send(JSON.stringify({message: `you are already following ${followed}`}))
                    
                }
                else{
                    doc.following.push(followed)
                    db.collection('users').findOneAndUpdate({username : username}, {$set : {following : doc.following}}, function(err, doc){
                        if(!err){
                            res.statusMessage='No content'
                            res.status(204).send(JSON.stringify({message: `you are now following ${followed}`}))
                        }
                        else{
                            res.statusMessage='Internal server error'
                            res.status(500).send(JSON.stringify({error: err.toString()}))
                        }
                    })
                }
            })
        }else{
            res.statusMessage='Internal server error'
            res.status(500).send(JSON.stringify({error: 'Unable to connect to database'}))
        }
    })
}

exports.publishPost = function(req, res){
    var title=req.body.title
    var content=req.body.content
    if(title.length===0 || content.length===0){
        res.statusMessage='missing field values'
        res.status(500).send(JSON.stringify({error: 'one or more field values missing'}))
        return
    }

    var username=req.user.username
    mongoclient.connect(url, {uri_decode_auth : true}, function(err, db){
        if(!err){
            db=db.db('user')
            db.collection('users').findOne({username : username}, {blogs : true}, function(err, doc){
                doc.blogs.push({title: title, content: content})
                db.collection('users').findOneAndUpdate({username : username}, {$set : {blogs : doc.blogs}}, function(err, doc){
                    if(!err){
                        res.statusMessage='Created'
                        res.status(201).send(JSON.stringify({message: 'post published succesfully'}))
                    }
                    else{
                        res.statusMessage='Internal server error'
                        res.status(500).send(JSON.stringify({error: err.toString()}))
                    }
                })
            })
        }else{
            res.statusMessage='Internal server error'
            res.status(500).send(JSON.stringify({error: 'Unable to connect to database'}))
        } 
    })
}

exports.getFeed = function(req, res){
    var username=req.user.username
    mongoclient.connect(url, {uri_decode_auth : true}, function(err, db){
        if(!err){
            db=db.db('user')
            db.collection('users').findOne({username : username}, {following : true}, function(err, doc){
            
                if(!err){
                    db.collection('users').find({username: {$in : doc.following}}, {username : true, blogs: true}, function(err, docs){
                        if(!err){
                            docs.toArray(function(err, items){
                                feeds=[]
                                items.forEach(element => {
                                    feed={
                                        username: element.username,
                                        blogs: element.blogs
                                    }
                                    feeds.push(feed)
                                });
                                res.statusMessage='OK'
                                res.status(200).send(JSON.stringify({feeds}))
                            })
                        }else{
                            res.statusMessage='Internal server error'
                            res.status(500).send(JSON.stringify({error: err.toString()}))
                        }
                    
                    })
                }else{
                    res.statusMessage='Internal server error'
                    res.status(500).send(JSON.stringify({error: err.toString()}))
                }
            })
        }else{
            res.statusMessage='Internal server error'
            res.status(500).send(JSON.stringify({error: 'Unable to connect to database'}))
        }
    })
}