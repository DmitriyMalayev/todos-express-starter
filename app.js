require('dotenv').config(); //Loads environment variables from an env file. 
var createError = require('http-errors');  //Module which helps create http error objects 
var express = require('express'); //core express framework. used to create web servers and handling http requests. 
var path = require('path'); //provides utilities for working with file and directory paths 
var cookieParser = require('cookie-parser'); //middleware which parses cookies attached to incoming http requests, making them accessible to the app 
var logger = require('morgan'); //middleware which logs http requests to the console, used for debugging
var passport = require('passport') //authentication middleware 
var session = require('express-session') //adds session support to app, allowing you to store user data across multiple requests. 

var SQLiteStore = require('connect-sqlite3')(session); //configures the session middleware to use SQLite to store session data in a file 
var indexRouter = require('./routes/index'); //imports route definitions for the main part of the app
var authRouter = require("./routes/auth") //imports route definitions for auth related functionality 
var app = express(); //creates instance of the express app 

app.locals.pluralize = require('pluralize'); //adds pluralize library for ejs 

// view engine setup
app.set('views', path.join(__dirname, 'views')); //looks for template ejs files in the views directory 
app.set('view engine', 'ejs'); //sets ejs as the templating engine for the app 

app.use(logger('dev')); //enables morgan logger in development mode 
app.use(express.json()); //parses incoming JSON data from requests 
app.use(express.urlencoded({ extended: false })); //parses incoming url encoded data from forms 
app.use(cookieParser());  //enables cookie parsing 
app.use(express.static(path.join(__dirname, 'public')));  //Serves static files (images, css, js) from public directory 
app.use(session({ ////configures session handling using SQLite for storage 
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}))
app.use(passport.authenticate('session')) //initializes passport and uses sessions for authentication 


app.use('/', indexRouter);  //mounts indexRouter to handle requests to the rootpath 
app.use('/', authRouter); //mounts authRouter to handle authentication related requests. 

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app; 
