

exports.Blog = class Blog{
    constructor(title, content){
        if(title.length ===0) throw 'title length cannot be zero'
        if(content.length ===0) throw 'content length cannot be zero'

        this.title=title
        this.content=content
        
    }
}

exports.User = class User{

    constructor(username, password, firstname, lastname){
        if(username.length===0) throw 'username length cannot be zero'
        if(password.length===0) throw 'password length cannot be zero'
        if(firstname.length===0) throw 'firstname length cannot be zero'
        if(lastname.length===0) throw 'lastname length cannot be zero'
        
        this.username=username
        this.password=password
        this.firstname=firstname
        this.lastname=lastname
        this.blogurl=username+'.domain.com'
        this.blogs=[]
        this.following=[]
    }
}
