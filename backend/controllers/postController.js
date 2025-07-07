
// --- controllers/postController.js ---
// This file contains the logic for handling post-related API requests.

const Post = require('../models/Post'); // Import the Post Mongoose model

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    // Find all posts and sort them by creation date in descending order (newest first)
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new post
exports.createPost = async (req, res) => {
  // Destructure required fields from the request body
  const { user, imageUrl, caption } = req.body;

  // Basic validation
  if (!user || !user.name || !imageUrl) {
    return res.status(400).json({ message: 'User name and image URL are required.' });
  }

  // Create a new Post instance
  const newPost = new Post({
    user: {
      name: user.name,
      avatar: user.avatar || 'https://placehold.co/100x100/87CEEB/000000?text=YOU', // Use provided avatar or default
    },
    imageUrl,
    caption,
    likes: 0, // New posts start with 0 likes
    comments: [], // New posts start with no comments
  });

  try {
    // Save the new post to the database
    const savedPost = await newPost.save();
    res.status(201).json(savedPost); // Respond with the created post
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Like/Unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // This is a simplified like toggle. In a real app, you'd track
    // which user liked the post to prevent multiple likes from one user.
    post.likes = (post.likes || 0) + 1; // Increment likes
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  const { user, text } = req.body; // Expect user and text for the comment

  if (!user || !text) {
    return res.status(400).json({ message: 'Comment user and text are required.' });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Add the new comment to the comments array
    post.comments.push({ user, text });
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
