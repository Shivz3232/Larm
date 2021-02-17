/*
 *  Heart of the server
 *  
 */

// Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const config = require("./config");
const blogRoutes = require("../Routes/blogs");
const userRoutes = require("../Routes/users");
const sessionRoutes = require("../Routes/sessions");

// Initiate the server module object
const server = {};

// Create the express app
server.app = express();

// Init server
server.init = function() {

    // Set the request parser
    server.app.use(bodyParser.urlencoded({
        extended: true
    }));

    // Use client-sesssion library to manage sessions with cookies
    server.app.use(session(config.cookieConfig));
    
    // Set the routes
    server.app.use("/api/blogs", blogRoutes);
    server.app.use("/api/users", userRoutes);
    server.app.use("/api/session", sessionRoutes);

    // Ping the API
    server.app.all("/api/ping", function(req, res) {
        res.send("The API is online.");
    });
    
    // Connect to the db
    mongoose.connect(config.MONGO_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: true
    }, function(err) {
        if (!err) {
            console.log("\x1b[34mConnected to MongoDB successfully.\x1b[0m");
        } else {
            process.exit(0);
        }
    });
    
    server.app.listen(config.HTTP_PORT, "localhost", function() {
        console.log("\x1b[34mServer listening on port " + config.HTTP_PORT + "!\x1b[0m");
    });
}

// Export the app
module.exports = server;