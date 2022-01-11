/*
 *  Primary file for handling the routes at /api/blogs
 *
 */

// Dependencies
const express = require("express");
const router = express.Router();
const Blog = require("../Schema/blogSchema");
const middleware = require("../lib/middleware");

// Extract cookie data if present
router.use(middleware.extractCookieData);

// GET all blogs
// Required data: None
// Optional data: None
router.get("/all", function(req, res) {
    // Query all blogs and return
    Blog.find({}, "-__v", function(err, blogData) {
        if (!err && blogData) {
            // Construct an object and resposd
            const blogs = {
                "blogs": blogData
            };
            res.json(blogs);
            res.end()
        } else {
            res.status(500);
            res.json({
                "Msg": "Failed to query DB. Please try again."
            });
            res.end();
        }
    });
});

// GET blog
// Required data: blogId
// Optional data: None
router.get("/:blogId", function(req, res) {
    // Verify required parameters
    const blogId = typeof (req.params.blogId) == "string" && req.params.blogId.trim().length == 24 ? req.params.blogId.trim() : false;
    if (blogId) {
        Blog.findById(blogId, function(err, blogData) {
            if (!err) {
                if (blogData) {
                    console.log(blogDat);
                    res.end();
                } else {
                    res.status(204);
                    res.end();
                }
            } else {
                res.status(500);
                res.json({
                    "Msg": "Failed to query DB. Please try again."
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

// Delete blog
// Required data: blogId, session
// Optional data: None
router.delete("/:blogId", middleware.requireLogin, function(req, res) {
    // Verify required parameters
    const blogId = typeof (req.params.blogId) == "string" && req.params.blogId.trim().length == 24 ? req.params.blogId.trim() : false;
    if (blogId) {
        Blog.findById(blogId, "creator", function(err, blogData) {
            if (!err && blogData) {
                // Verify if the blog belongs to the user
                if (blogData.creator.equals(req.user._id)) {
                    Blog.deleteOne({ _id: blogId }, function(err, data) {
                        if (!err) {
                            if (data.deletedCount == 1) {
                                res.end();
                            } else {
                                res.status(400);
                                res.json({
                                    "Msg": "Blog doesn't exist."
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
                    });
                } else {
                    res.status(401);
                    res.json({
                        "Msg": "Blog creator and requestor mis-match."
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
        });
    } else {
        res.status(400);
        res.json({
            "Msg": "Invalid User Id provided. Please try again."
        });
        res.end();
    }
});

// Edit blog
// Required data: session
// Optional data: blog title, blog text
router.put("/:blogId", middleware.requireLogin, function(req, res) {
    // Verify required and optional parameters
    const blogId = typeof (req.params.blogId) == "string" && req.params.blogId.trim().length == 24 ? req.params.blogId.trim() : false;
    const title = typeof (req.body.title) == "string" && req.body.title.trim().length > 0 ? req.body.title.trim() : false;
    const text = typeof (req.body.text) == "string" && req.body.text.trim().length > 0 ? req.body.text.trim() : false;
    if (blogId && (title || text)) {
        Blog.findById(blogId, function(err, blogData) {
            if (!err && blogData) {
                // Verify if the blog belongs to the user
                if (blogData.creator.equals(req.user._id)) {
                    if (title) {
                        blogData.title = title
                    }
                    if (text) {
                        blogData.text = text
                    }
                    blogData.save(function(err) {
                        if (!err) {
                            res.end();
                        } else {
                            res.status(500);
                            res.json({
                                "Msg": "Failed to update document. Please try again."
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
            } else {
                res.status(500);
                res.json({
                    "Msg": "Failed to query DB. Please try again."
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

// Delete blog
// Required data: title, text, session
// Optional data: None
router.post("/", middleware.requireLogin, function(req, res) {
    // Verify required data
    const title = typeof (req.body.title) == "string" && req.body.title.trim().length > 0 ? req.body.title.trim() : false;
    const text = typeof (req.body.text) == "string" && req.body.text.trim().length > 0 ? req.body.text.trim() : false;
    if (title && text) {
        // Cerate the blog and save it
        const blog = new Blog({
            creator: req.user._id,
            title: title,
            text: text
        });
        blog.save(function(err) {
            if (!err) {
                res.end();
            } else {
                res.status(500);
                res.json({
                    "Msg": "Failed to save blog. Please try again."
                });
                res.end();
            }
        });
    } else {
        res.status(400);
        res.json({
            "Msg": "Invalid input parameters. Please try again."
        });
        res.end();
    }
});

// Like blog
// Required data: blogId, session
// Optional data: None
router.put("/like/:blogId", middleware.requireLogin, function(req, res) {
    // Verify required parameters
    const blogId = typeof (req.params.blogId) == "string" && req.params.blogId.trim().length == 24 ? req.params.blogId.trim() : false;
    if (blogId) {
        // Find the blog and add the current user id to likes array
        Blog.findById(blogId, "likes", function(err, blogData) {
            if (!err && blogData) {
                // If user has already liked the blog then remove the userId from the likes else add it
                const index = blogData.likes.indexOf(req.user._id);
                if (index == -1) {
                    blogData.likes.push(req.user._id);
                    blogData.save(function(err){
                        if (!err) {
                            res.end();
                        } else {
                            res.status(500);
                            res.json({
                                "Msg": "Failed to like blog. Please try again."
                            });
                            res.end();
                        }
                    })
                } else {
                    blogData.likes.splice(index, 1);
                    blogData.save(function(err) {
                        if (!err) {
                            res.end();
                        } else {
                            res.status(500);
                            res.json({
                                "Msg": "Failed to un-like blog. Please try again."
                            });
                            res.end();
                        }
                    })
                }
            } else {
                res.status(500);
                res.json({
                    "Msg": "Request failed. Please try again."
                });
                res.end();
            }
        });
    } else {
        res.status(400);
        res.json({
            "Msg": "Invalid input parameters. Please try again."
        });
        res.end();
    }
});

// GET user blogs
// Required data: userId, session
// Optional data: None
router.get("/user/:userId", middleware.requireLogin, function(req, res) {
    // Validate required parameters
    const userId = typeof (req.params.userId) == "string" && req.params.userId.trim().length == 24 ? req.params.userId.trim() : false;
    if(userId) {
        // Search and return all the blogs belonging to the user
        Blog.find({ creator: userId }, "-__v", function(err, blogData) {
            if (!err) {
                // Construct the json response and respond
                const blogs = {
                    blogs: blogData
                }
                res.json(blogs);
                res.end();
            } else {
                res.status(500);
                res.json({
                    "Msg": "Request failed. Please try again."
                });
                res.end();
            }
        });
    } else {
        res.status(400);
        res.json({
            "Msg": "Invalid input parameters. Please try again."
        });
        res.end();
    }
});

// Export the routes
module.exports = router;