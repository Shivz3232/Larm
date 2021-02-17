/*
 *  Primary file for handling session logic
 *
 */

// Dependencies
const express = require("express");
const router = express.Router();
const User = require("../Schema/userSchema");
const middleware = require("../lib/middleware");

// Extract cookie data if present
router.use(middleware.extractCookieData);

// Create session
// Required data: cookie
// Optional data: None
router.post("/create", function(req, res) {
    // Verify requried parameters
    const email = typeof (req.body.email) == "string" && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(req.body.email.trim()) ? req.body.email.trim() : false;
    const password = typeof (req.body.password) == "string" && req.body.password.trim().length > 7 ? req.body.password.trim() : false;
    if (email && password) {
        // Lookup if the user exits and match the password
        User.findOne({ email: email }, "_id password", function(err, userData) {
            if (!err && userData) {
                userData.comparePassword(password, function(err, isMatch) {
                    if (!err && isMatch) {
                        req.session.user = userData;
                        res.end();
                    } else {
                        res.status(400);
                        res.json({
                            "Msg": "Password mismatch. Please try again."
                        });
                        res.end();
                    }
                })
            } else {
                res.status(400);
                res.json({
                    "Msg": "User with given email does not exist."
                });
                res.end();
            }
        });
    } else {
        res.status(400);
        res.json({
            "Msg": "Invalid or missing parameters. Please try again."
        });
        res.end();
    }
});

// Destroy session
// Required data: cookie
// Optional data: None
router.delete("/destroy", middleware.requireLogin, function(req, res) {
    req.session.destroy();
    req.end();
});

// Export the router
module.exports = router;