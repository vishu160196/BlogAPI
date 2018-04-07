var mongoclient=require('./server').mongoclient
var url=require('./server').url
var models = require('./models')

exports.follow = function(req, res){
    
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
    
}