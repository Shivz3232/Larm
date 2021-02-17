/*
 *  Blog Schema
 *
 */

// Dependencies
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require('./userSchema');

const blogSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: User,
        required: true
    },
    title: {
        type: Schema.Types.String,
        required: true
    },
    text: {
        type: Schema.Types.String,
        required: true
    },
    likes: {
        type: [Schema.Types.ObjectId],
        default: []
    }
});

// Generate the model
blogModel = mongoose.model("Blogs", blogSchema);

// Export the model
module.exports = blogModel;