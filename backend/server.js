// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file

// Import Post model (now updated to include user, likedBy, and userId in comments)
const Post = require('./models/Post');
// Import User model to fetch user details
const User = require('./models/User');

// Import authentication router and verifyToken middleware
const { router: authRouter, verifyToken } = require('./routes/auth');

const app = express();
const port = process.env.PORT || 5000; // Use port from .env or default to 5000

// --- Middleware Setup ---
app.use(cors()); // Enable Cross-Origin Resource Sharing for all routes
app.use(express.json()); // Enable parsing of JSON request bodies (for req.body)

// --- MongoDB Connection ---
const uri = process.env.MONGODB_URI; // Get MongoDB URI from environment variables
mongoose.connect(uri)
  .then(() => console.log('Connected to MongoDB Atlas!')) // Success message
  .catch(err => console.error('MongoDB connection error:', err)); // Error message

// --- API Routes ---

// Authentication Routes (Public access)
// All routes defined in auth.js will be prefixed with /api/auth
app.use('/api/auth', authRouter);

// Post Routes (Some are protected, some are public)

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public (Anyone can view posts without logging in)
app.get('/api/posts', async (req, res) => {
  try {
    // Find all posts and sort by date in descending order (newest first)
    // Populate user details for comments if needed, but we're storing username directly now.
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private (Requires a valid JWT in the Authorization header)
app.post('/api/posts', verifyToken, async (req, res) => {
  // req.user.id is available here because the verifyToken middleware attached it
  const { imageUrl, caption } = req.body;

  try {
    // Fetch the user from the database using the ID from the token
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create a new Post document
    const newPost = new Post({
      user: req.user.id, // Store the actual user ID (ObjectId)
      username: user.username, // Store the username for display
      // Placeholder avatar based on first letter of username, or you can add a userAvatar field to User model
      userAvatar: user.userAvatar || `https://placehold.co/100x100/87CEEB/000000?text=${user.username.substring(0,1).toUpperCase()}`,
      imageUrl,
      caption
    });

    // Save the new post to the database
    const savedPost = await newPost.save();
    res.status(201).json(savedPost); // Respond with the newly created post data
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/posts/:id/like
// @desc    Like/Unlike a post (unique like per user)
// @access  Private (Requires a valid JWT)
app.put('/api/posts/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if the user has already liked this post
    const userLikedIndex = post.likedBy.findIndex(
      (likeUserId) => likeUserId.toString() === req.user.id
    );

    if (userLikedIndex === -1) {
      // User has not liked it yet, so add like
      post.likes = (post.likes || 0) + 1;
      post.likedBy.unshift(req.user.id); // Add user ID to likedBy array
    } else {
      // User has already liked it, so unlike (remove like)
      post.likes = (post.likes || 1) - 1; // Ensure it doesn't go below 0
      if (post.likes < 0) post.likes = 0; // Prevent negative likes
      post.likedBy.splice(userLikedIndex, 1); // Remove user ID from likedBy array
    }

    await post.save();
    res.json({ likes: post.likes, likedBy: post.likedBy }); // Respond with updated likes and likedBy array
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private (Requires a valid JWT)
app.post('/api/posts/:id/comment', verifyToken, async (req, res) => {
  const { text } = req.body; // Frontend will send only the comment text

  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Fetch the authenticated user's username to associate with the comment
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newComment = {
      user: req.user.id, // Store the actual user ID of the commenter
      username: user.username, // Store the username of the commenter for display
      text: text
    };

    post.comments.unshift(newComment); // Add new comment to the beginning of the array (most recent first)

    await post.save();
    res.json({ comments: post.comments }); // Respond with the updated comments array
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (Requires a valid JWT and user must be the owner of the post)
app.delete('/api/posts/:id', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Check if the authenticated user is the owner of the post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this post' });
    }

    await Post.deleteOne({ _id: req.params.id }); // Use deleteOne for clarity
    res.json({ msg: 'Post removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/posts/:postId/comment/:commentId
// @desc    Delete a comment from a post
// @access  Private (Requires a valid JWT and user must be the owner of the comment OR the post)
app.delete('/api/posts/:postId/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // Find the comment to be deleted
    const comment = post.comments.find(
      (comm) => comm._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check if the authenticated user is the owner of the comment OR the owner of the post
    if (comment.user.toString() !== req.user.id && post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized to delete this comment' });
    }

    // Remove the comment from the comments array
    post.comments = post.comments.filter(
      ({ _id }) => _id.toString() !== req.params.commentId
    );

    await post.save();
    res.json({ comments: post.comments }); // Respond with the updated comments array
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
