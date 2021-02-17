/*
 *  Primary for custom middlewares used in the app
 *
 */

//  Dependencies
const User = require("../Schema/userSchema");

// The middleware module
const middleware = {}

// Check if the user is authorized
middleware.requireLogin = function(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401);
        res.json({
            "Msg": "Authorization required for access."
        })
        res.end();
    }
}

// Check if the cookie data belongs to valied user
middleware.extractCookieData = function(req, res, next) {
    if (req.session && req.session.user) {
        User.findById(req.session.user._id, "_id password", function(err, userData) {
            if (!err && userData && userData.password == req.session.user.password) {
                req.user = userData;
                req.session.user = userData;  //refresh the session value
                res.locals.user = userData;

                // finishing processing the middleware and run the route
                next();
            } else {
                res.status(400);
                res.json({
                    "Msg": "Invalid cookie. Please login again."
                })
                res.end();
            }
        });
    } else {
        next();
    }
}

// Export the middlewares
module.exports = middleware;