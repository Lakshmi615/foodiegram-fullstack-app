// backend/models/Post.js
const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId, // ID of the user who created the post
    ref: 'User',                         // References the 'User' model
    required: true
  },
  username: {
    type: String,
    required: true
  },
  userAvatar: { // Store user avatar directly (e.g., placeholder or actual URL)
    type: String,
    default: 'https://placehold.co/100x100/87CEEB/000000?text=USER'
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
    default: 0
  },
  likedBy: [ // NEW: Array to store IDs of users who liked this post
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      user: { // NEW: Store the actual user ID of the commenter for verification
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      username: { // Store username directly for display
        type: String,
        required: true
      },
      text: {
        type: String,
        required: true
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);
