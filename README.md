# BlogAPI

This repository contains APIs used in a typical blog application. The application provides following features to its users

1. Create a profile
2. Write blogs (only registered users)
3. Follow other users' blogs

The following API endpoints have been developed to implement above functionalities

### Login

Request format

    POST /login
    
    Content-type : application/json
    
    Body
    {
      "username" : String,
      "password" : String
    }


Any user who has registered with the application can log in using his username, password sent as a JSON object in request body

Response format

Upon succesful authentication

    200 OK
    
    Body
    {
      "message" : "Logged in as ${username}"
      "token" : JWT
    }
    
On unsuccesful authentication with incorrect username

    401 Unauthorized
    
    Body
    {
      "error" : "no user with this name exists"
    }
    
On unsuccesful authentication with incorrect password

    403 Forbidden
    
    Body
    {
      "error" : "incorrect password"
    }

### Register

    POST /register
    
    Content-type : application/json
    
    Body
    {
      "username" : String (unique, non empty),
      "password" : String (non empty),
      "firstname" : String (non empty),
      "lastname" : String (non empty),
    }

Upon succesful registration a blogURL for this user is created and sent back as response. All information pertaining to a user is stored in a MongoDB instance.
    
Response format

Upon succesful creation of user

    201 Created
    
    Body
    {
      "message" : "user created succesfully, please login to continue"
    }
    
On invalid field values(empty strings, duplicate username)

    500 Internal server error
    
    Body
    {
      "error" error raised at server end
    }

### Blogpost

    POST /blogpost
    
    Content-type : application/json
    Authorization : Bearer JWT
    
    Body
    {
      "title" : String (non empty),
      "content" : String (non empty)
    }
    
Only a logged in user can publish a blog post

Response format

On succesful publish

    201 Created
    
    Body
    {
      "message" : "post published succesfully"
    }
    
On unsuccesful publish due to invalid field values

    500 Internal server error
    
    Body
    {
      "error" : error raised at server end
    }
    
On unsuccesful publish due to authentication issues

    401 Unauthorized
    
    Body
    {
      "error" : "you are not logged in"
    }

### Follow

    PUT /follow/:username
    
    Content-type : application/json
    Authorization : Bearer JWT
    
    Body
    {
      "follow" : String (username)
    }
    
Adds "username" to list of followed people of logged in user

Response format

On succesful addition to list of followed people

    204 No content
    
    Body
    {
      "message" : "you are now following ${username}"
    }
    
On unsuccesful request due to authorization issues

    401 Unauthorized
    
    Body
    {
      "error" : "you are not logged in"
    }
    
If username is already being followed

    204 No content
    
    Body
    {
      "message" : "you are already following ${username}"
    }
    
### Feed

    GET /feed?username=
    
    Authorization : Bearer JWT
    
Returns a list of all blogposts published by users followed by logged in user

Response format

On succesful return of list

    200 OK
    
    Body
    [
        {
          "username" : String,
          "posts" : [String]
        }
    ]
    
On unsuccesful request due to authentication
    
    401 Unauthorized
    
    Body
    {
      "error" : "you are not logged in"
    }
