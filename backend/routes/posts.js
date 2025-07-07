
// --- routes/posts.js ---
// This file defines the API routes related to posts.

const express = require('express');
const router = express.Router(); // Create an Express router
const postController = require('../controllers/postController'); // Import post controller functions

// Define routes and link them to controller functions

// GET /api/posts - Get all posts
router.get('/', postController.getAllPosts);

// POST /api/posts - Create a new post
router.post('/', postController.createPost);

// GET /api/posts/:id - Get a single post by ID
router.get('/:id', postController.getPostById);

// PUT /api/posts/:id/like - Like/Unlike a post
router.put('/:id/like', postController.likePost);

// POST /api/posts/:id/comment - Add a comment to a post
router.post('/:id/comment', postController.addComment);

// DELETE /api/posts/:id - Delete a post
router.delete('/:id', postController.deletePost);

module.exports = router;
