/*
 *  Primary file for handling the routes at /api/users
 *
 */

// Dependencies
const express = require("express");
const router = express.Router();
const User = require("../Schema/userSchema");
const middleware = require("../lib/middleware");

// Extract cookie data if present
router.use(middleware.extractCookieData);

// GET User
// Required data: userId
// Optional data: None
router.get("/:userId", function(req, res) {
    // Verify required parameters
    const userId = typeof (req.params.userId) == "string" && req.params.userId.trim().length == 24 ? req.params.userId.trim() : false
    if (userId) {
        // Search user collection by id and return the object by removing any sensitve fields
        User.findById(userId, "-password -__v", function(err, userData) {
            if (!err) {
                if(userData) {
                    res.json(userData);
                } else {
                    res.status(204);
                    res.end();
                }
            } else {
                console.log(err);
                res.status(500);
                res.json({
                    "Msg": "Failed to query DB. Please try again."
                });
                res.end();
            }
        })
    } else {
        res.status(400);
        res.json({
            "Msg": "Invalid User Id provided. Please try again."
        });
        res.end();
    }
});

// POST User
// Required data: Name, email, password
// Optional data: None
router.post("/", function(req, res) {
    // Verify the required data
    const name = typeof (req.body.name) == "string" && req.body.name.trim().length > 0 ? req.body.name.trim() : false;
    const email = typeof (req.body.email) == "string" && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(req.body.email.trim()) ? req.body.email.trim() : false;
    const password = typeof (req.body.password) == "string" && req.body.password.trim().length > 7 ? req.body.password.trim() : false;
    if (name && email && password) {
        User.findOne({ email: email }, "-name -password -email", function(err, userData) {
            if (!err && userData === null) {
                // Build a new user document
                const user = new User({
                    name: name,
                    email: email,
                    password: password
                });
                
                // Save the document to DB
                user.save(function(err) {
                    if (!err) {
                        res.status(201).end();
                    } else {
                        console.log(err);
                        res.status(500);
                        res.json({
                            "Msg": "Failed to store user document to DB. Please try again."
                        });
                        res.end();
                    }
                });
            } else {
                res.status(400);
                res.json({
                    "Msg": "User with the provided email already exists."
                });
                res.end();
            }
        });
    } else {
        res.status(400);
        res.json({
            "Msg": "Invalid input. Please try again."
        });
        res.end();
    }
});

// DELETE User
// Required data; userId
// Optional data; None
router.delete("/:userId", middleware.requireLogin, function(req, res) {
    // Verify required parameters
    const userId = typeof (req.params.userId) == "string" && req.params.userId.trim().length == 24 ? req.params.userId.trim() : false;
    if (userId) {
        // Search user document by Id for cross checking owner
        User.findById(userId, "_id name", function(err, userData) {
            if (userData._id.equals(req.user._id)) {
                // Find user document by document id and purge
                User.deleteOne({ _id: userId }, function(err, data) {
                    if (!err && data) {
                        if (data.deletedCount == 1) {
                            res.end();
                        } else {
                            res.status(400);
                            res.json({
                                "Msg": "User doesn't exist."
                            });
                            res.end();
                        }
                    } else {
                        res.status(500);
                        res.json({
                            "Msg": "Failed to query DB. Please try again."
                        });
                        res.end();
                    }
                })
            } else {
                res.status(401);
                res.json({
                    "Msg": "Blog creator and requestor mis-match."
                });
                res.end();
            }
        });
    } else {
        res.status(400);
        res.json({
            "Msg": "Invalid User Id provided. Please try again."
        });
        res.end();
    }

});

// PUT User
// Required data: userId, JWT Token
// Optional data: Name
router.put("/:userId", middleware.requireLogin, function(req, res) {
    // Validate required and optional parameters 
    const name = typeof (req.body.name) == 'string' && req.body.name.trim().length > 0 ? req.body.name.trim() : false;
    const userId = typeof (req.params.userId) == 'string' && req.params.userId.trim().length > 0 ? req.params.userId.trim() : false;
    if (name && userId) {
        // Search user document by Id for cross checking owner
        User.findById(userId, "_id name", function(err, userData) {
            if (userData._id.equals(req.user._id)) {
                // Update the name and save
                userData.name = name;
                userData.save(function(err) {
                    if (!err) {
                        res.end();
                    } else {
                        res.status(500);
                        res.json({
                            "Msg": "Failed to query DB. Please try again."
                        });
                        res.end();
                    }
                });
            } else {
                res.status(401);
                res.json({
                    "Msg": "Blog creator and requestor mis-match."
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

// Export the routes
module.exports = router;