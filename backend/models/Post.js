
// backend/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // This field will store the unique ID of the user who created the post
    ref: 'User',                         // It references the 'User' model, establishing a relationship
    required: true                       // Every post must be associated with a user
  },
  username: { // Store username directly for easier display on the frontend without extra lookups
    type: String,
    required: true
  },
  userAvatar: { // Store user avatar directly for display
    type: String,
    default: 'https://placehold.co/100x100/87CEEB/000000?text=USER' // Default placeholder avatar
  },
  imageUrl: {
    type: String,
    required: true
  },
  caption: {
    type: String,
    required: true
  },
  likes: {
    type: Number,
    default: 0 // Initialize likes to 0 for new posts
  },
  comments: [ // An array of comments, where each comment is an object
    {
      user: { // The username of the commenter
        type: String,
        required: true
      },
      text: { // The text content of the comment
        type: String,
        required: true
      },
      date: { // Timestamp for when the comment was made
        type: Date,
        default: Date.now
      }
    }
  ],
  date: { // Timestamp for when the post was created
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);


