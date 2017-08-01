# node-gmail-example

Example of retrieving gmail messages using node.

View the running app on [Heroku](https://node-gmail-example.herokuapp.com/)


### Create a Google Project

#### Enable APIs:
1. Google+
1. Gmail

Under Credentials, create an OAuth 2.0 client ID

Set the Authorized JavaScript origins to have your url, e.g.:

    http://127.0.0.1:5000
    
Set the Authorized redirect URIs to have your url, e.g.:

    http://127.0.0.1:5000/auth/google/callback
    
Download the JSON credentials file and save as google-secret.json