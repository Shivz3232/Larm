/*
 *  Server header
 *
 */

// Dependencies
const server = require("./lib/server");

// Declare the app
const app = {};

// Init function
app.init = function() {
    // Start the server
    server.init();
}

// Self invoking only if required directly
if (require.main === module) {
    app.init();
}

// Export the app
module.exports = app;