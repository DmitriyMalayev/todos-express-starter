var express = require("express")
var passport = require("passport")
var LocalStrategy = require("passport-local") //Imports the LocalStrategy module from Passport.js which allows users to authenticate via  a username and password 
var crypto = require("crypto")  //imports crypto module for hashing passwords 
var db = require("../db")  //imports database module 
var router = express.Router() //creates an express router instance to handle authentication related routes 

passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.get('SELECT * FROM users WHERE username = ?', [username], function (err, row) {
        if (err) { return cb(err); }
        if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }

        crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function (err, hashedPassword) {
            if (err) { return cb(err); }
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
                return cb(null, false, { message: 'Incorrect username or password.' });
            }
            return cb(null, row);
        });
    });
}));

/*
This registers a new LocalStrategy with Passport.js. The verify function is the core of this strategy:

It takes the username and password submitted by the user.
It queries the database (db.get) to find a user with the given username.
If no user is found or there's a database error, it calls the cb (callback) function with an error or false to indicate authentication failure.
If a user is found, it uses crypto.pbkdf2 to hash the provided password using the salt stored in the database for that user. 
This ensures that even if the database is compromised, the actual passwords are not exposed.
It compares the hashed password with the stored hashed password using crypto.timingSafeEqual to prevent timing attacks.
If the passwords match, it calls the cb function with the user object to indicate successful authentication.
*/ 


passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, { id: user.id, username: user.username })
    })
})

/*
This function defines how user data is serialized (converted into a format suitable for storing in a session) when the user logs in. Here, it simply stores the user's ID and username in the session.
*/ 

passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user)
    })
})

/*
This function defines how user data is deserialized (converted back into a user object) when the session is accessed in subsequent requests. Here, it simply passes the user object from the session to the callback.
*/ 
router.get("/login", (req, res, next) => {
    res.render("login")
})
//This defines a GET route handler for /login, which presumably renders a login form  

router.post('/login/password', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
}));
/*
This defines a POST route handler for /login/password that uses the passport.authenticate middleware with the 'local' strategy. 
This middleware handles the authentication process using the LocalStrategy configured earlier.
If authentication is successful (successRedirect: '/'), it redirects the user to the home page (/).
If authentication fails (failureRedirect: '/login'), it redirects the user back to the login page.
*/ 

router.post('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err)
        } else {
            res.redirect("/")
        }
    })
}) //This defines a POST route handler for /logout that logs the user out using req.logout(). After logout, it redirects the user to the home page (/).


module.exports = router