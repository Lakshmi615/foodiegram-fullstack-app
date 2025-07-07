
// --- models/Post.js ---
// This file defines the Mongoose schema for a 'Post' in your database.

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true, // Remove whitespace from both ends of a string
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  user: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String, // URL to the user's avatar image
      default: 'https://placehold.co/100x100/CCCCCC/000000?text=User', // Default avatar
    },
  },
  imageUrl: {
    type: String, // URL to the post's image
    required: true,
  },
  caption: {
    type: String,
    trim: true,
    maxlength: 500, // Optional: limit caption length
  },
  likes: {
    type: Number,
    default: 0,
  },
  comments: [commentSchema], // Array of comment sub-documents
  createdAt: {
    type: Date,
    default: Date.now, // Automatically set creation date
  },
}, {
  timestamps: true // Adds `createdAt` and `updatedAt` fields automatically
});

// Create and export the Post model
module.exports = mongoose.model('Post', postSchema);

