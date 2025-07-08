// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Load environment variables from .env file (e.g., MONGODB_URI, PORT, JWT_SECRET)

// Import Post model (now updated to include user field)
const Post = require('./models/Post');

// Import authentication router and verifyToken middleware from auth.js
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
    // .populate('user', 'username userAvatar') could be used here if you want to fetch
    // the full user object from the User collection, but we're storing username/avatar directly in Post for simplicity.
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
    // This is important to get the username and potentially other user details.
    const user = await mongoose.model('User').findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Create a new Post document
    const newPost = new Post({
      user: req.user.id, // Store the actual user ID (ObjectId)
      username: user.username, // Store the username for display
      userAvatar: user.userAvatar || 'https://placehold.co/100x100/87CEEB/000000?text=' + user.username.substring(0,1).toUpperCase(), // Use user's avatar if available, otherwise a placeholder
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
// @desc    Like a post
// @access  Private (Requires a valid JWT)
app.put('/api/posts/:id/like', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    // For simplicity, we're just incrementing likes.
    // In a real app, you'd track which user liked the post to prevent multiple likes
    // and allow unliking.
    post.likes = (post.likes || 0) + 1; // Ensure likes is a number, default to 0 if undefined

    await post.save();
    res.json({ likes: post.likes }); // Respond with the updated like count
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
    const user = await mongoose.model('User').findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const newComment = {
      user: user.username, // Store the username of the commenter
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

// --- Server Start ---
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
