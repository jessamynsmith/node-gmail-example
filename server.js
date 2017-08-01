'use strict';

var path = require("path");

var express = require('express');
var sslRedirect = require('heroku-ssl-redirect');
var hbs = require('express-hbs');

var morgan = require('morgan');
var session = require('express-session');
var passport = require('passport');
var GoogleOAuth2Strategy = require('passport-google-auth').Strategy;

var google = require('googleapis');
var googleSecret = require('./google-secret');

var app = express();

app.use(morgan('dev')); // log every request to the console

app.use(session({ secret: 'somethingverysecret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

passport.use(new GoogleOAuth2Strategy({
    clientId: googleSecret.web.client_id,
    clientSecret: googleSecret.web.client_secret,
    callbackURL: 'http://127.0.0.1:5000/auth/google/callback',
    accessType: 'offline',
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/gmail.readonly'
    ]
  },
  function (accessToken, refreshToken, profile, done) {
    return done(null, {accessToken: accessToken, email: profile.emails[0].value});
  }
));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});


// set the view engine
app.set('view engine', 'hbs');

// configure the view engine
app.engine('hbs', hbs.express4());

// enable ssl redirect
app.use(sslRedirect());

app.get('/', function (req, res) {
  return res.render('index', {user: req.user});
});

app.get('/login', passport.authenticate('google'));

app.get('/auth/google/callback',
  passport.authenticate('google', {failureRedirect: '/', successRedirect: '/messages'})
);

app.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

app.get('/messages', function (req, res) {
  var gmail = google.gmail('v1');
  var OAuth2 = google.auth.OAuth2;

  var oauth2Client = new OAuth2(
    googleSecret.web.client_id,
    googleSecret.web.client_secret,
    googleSecret.web.javascript_origins[0]
  );

  oauth2Client.setCredentials({
    access_token: req.user.accessToken,
    refresh_token: null
    // Optional, provide an expiry_date (milliseconds since the Unix Epoch)
    // expiry_date: (new Date()).getTime() + (1000 * 60 * 60 * 24 * 7)
  });

  gmail.users.messages.list({
    userId: 'me',
    auth: oauth2Client
  }, function (err, response) {
    return res.render('messages', { error: err, response: response});
  });
});

app.set('port', process.env.PORT || 5000);

app.listen(app.get('port'), function () {
  console.log('Express server listening on port ' + app.get('port'));
});
