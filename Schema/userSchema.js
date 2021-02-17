/*
 *  User Schema
 *
 */

// Dependencies
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const helpers = require("../lib/helpers");

const userSchema = new Schema({
    name: {
        type: Schema.Types.String,
        required: true
    },
    email: {
        type: Schema.Types.String,
        require: true
    },
    password: {
        type: Schema.Types.String,
        required: true
    }
});

// Hash the password before saving
userSchema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password')) {
        return next();
    } else {
        const hashedPassword = helpers.hash(user.password);
        user.password = hashedPassword;
        next();
    }
}, function (err) {
    next(err);
});

// Method to cross-check given password with the one that is saved
userSchema.methods.comparePassword=function(candidatePassword,next) {
    const hashedPassword = helpers.hash(candidatePassword);
    if (hashedPassword) {
        if (hashedPassword == this.password) {
            next(null, true);
        } else {
            next(null, false);
        }
    } else {
        next({
            "Msg": "Falied to hash password"
        });
    }
}

// Create the model
userModel = mongoose.model("Users", userSchema);

// Export the model
module.exports = userModel;