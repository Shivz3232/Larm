/*
 *  API Configurations
 *
 */

// Environments module
const environments = {}
const dev_keys = !process.env.NODE_ENV ? require("../dev.keys.json") : undefined;

// Configurations for staging
environments.staging = {
    "HTTP_PORT": dev_keys ? dev_keys.HTTP_PORT : undefined,
    "MONGO_URI": dev_keys ? dev_keys.MONGO_URI : undefined,
    "COOKIE_SECRET": "^Kw!BdrV76#Tt*V5", 
    "SECURE_COOKIE": false,
    "hashingSecret": "hGa#?+b_M8JvGSKJ"
}

// Configuraitions for production
environments.production = {
    "HTTP_PORT": process.env.PORT,
    "MONGO_URI": process.env.MONGO_URI,
    "COOKIE_SECRET": "^Kw!BdrV76#Tt*V5", 
    "SECURE_COOKIE": false,
    "hashingSecret": process.env.hashingSecret
}

// Identify the current environment, default to staging
const currentEnvironment = typeof (process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : "staging";

// Choose the appropriate environment configurations
const environmentToExport = typeof (environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments["staging"];

// Export the configurations
module.exports = environmentToExport;