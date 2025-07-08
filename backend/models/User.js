// backend/models/User.js
const mongoose = require('mongoose');

// Define the User Schema
// This schema describes the structure and validation rules for user documents in MongoDB.
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,      // Username is mandatory
    unique: true,        // Each username must be unique in the database
    trim: true,          // Remove leading/trailing whitespace
    minlength: 3         // Minimum length for username is 3 characters
  },
  password: {
    type: String,
    required: true,      // Password is mandatory
    minlength: 6         // Minimum length for password is 6 characters
  },
  // You can add more fields here later if needed, e.g., email, profile picture, etc.
}, {
  timestamps: true // Mongoose will automatically add 'createdAt' and 'updatedAt' fields
});

// Create and export the User model
// The model provides an interface to interact with the 'users' collection in MongoDB.
module.exports = mongoose.model('User', UserSchema);
