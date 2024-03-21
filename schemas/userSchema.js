/**
 * Import the Mongoose module for defining schemas and models.
 */
const mongoose = require('mongoose');

/**
 * Define the user schema for MongoDB.
 * This schema describes the structure of user documents in the database.
 */
const userSchema = new mongoose.Schema({
    // Unique identifier for the user.
    user_id: String,
    // Email address of the user.
    user_email: String,
    // Zmail address of the user.
    user_zmail: String,
    // Access token associated with the user.
    access_token: String,
    // Refresh token associated with the user.
    refresh_token: String,
    // Timestamp indicating the date and time when the document was created.
    createdAt: { type: Date, default: Date.now } // Current datetime when the document is created
});

/**
 * Create a Mongoose model based on the user schema.
 * This model represents the collection of users in the database.
 */
const User = mongoose.model("User", userSchema);

/**
 * Export the User model for use in other modules.
 */
module.exports = User;