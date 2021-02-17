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
    blogSchema.find({}, function(err, blogs) {
        if (!err && blogs) {
            console.log(blogs);
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
// Required data: blogId
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
// Required data: blogId
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
// Required data: title, text
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

// Export the routes
module.exports = router;