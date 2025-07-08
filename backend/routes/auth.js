// backend/routes/auth.js
const router = require('express').Router(); // Import Express Router to create modular route handlers
const bcrypt = require('bcryptjs');       // For hashing and comparing passwords securely
const jwt = require('jsonwebtoken');      // For creating and verifying JSON Web Tokens (JWTs)
const User = require('../models/User');   // Import the User model to interact with user data

// Load environment variables from .env file (specifically for process.env.JWT_SECRET)
require('dotenv').config();

// --- Helper Middleware for JWT Verification ---
// This middleware function will be used to protect routes that require authentication.
// It checks if a valid JWT is present in the request header.
const verifyToken = (req, res, next) => {
  // Get token from the Authorization header (e.g., "Bearer TOKEN_STRING")
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    // If no Authorization header is present, deny access
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Extract the token string (remove "Bearer " prefix)
  const token = authHeader.split(' ')[1];

  if (!token) {
    // If the header exists but the token part is missing, deny access
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the token using the secret key from environment variables
    // jwt.verify decodes the token if it's valid and returns the payload.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user ID from the token's payload to the request object (req.user)
    // This makes the authenticated user's ID available to subsequent route handlers.
    req.user = decoded.user;
    next(); // Proceed to the next middleware or the actual route handler
  } catch (err) {
    // If token verification fails (e.g., invalid token, expired token)
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// --- Authentication Routes ---

// @route   POST /api/auth/register
// @desc    Register a new user (Sign-up)
// @access  Public (anyone can access this route)
router.post('/register', async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  try {
    // 1. Check if a user with the given username already exists in the database
    let user = await User.findOne({ username });
    if (user) {
      // If user exists, return a 400 Bad Request error
      return res.status(400).json({ msg: 'User already exists' });
    }

    // 2. Create a new User instance with the provided username and password
    user = new User({
      username,
      password
    });

    // 3. Hash the password for security
    // Generate a salt (a random string) to add to the password before hashing.
    // This makes the hash unique even for identical passwords.
    const salt = await bcrypt.genSalt(10); // 10 is a good default for salt rounds
    // Hash the user's password with the generated salt
    user.password = await bcrypt.hash(password, salt);

    // 4. Save the new user document to the MongoDB database
    await user.save();

    // 5. Create and return a JSON Web Token (JWT) for the newly registered user
    // The payload contains the user's ID, which will be used to identify the user later.
    const payload = {
      user: {
        id: user.id // Mongoose automatically creates an _id field for each document, accessible as .id
      }
    };

    // Sign the token with the payload, your secret key, and an expiration time
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Your secret key (defined in .env)
      { expiresIn: '1h' },    // Token will expire in 1 hour (for security)
      (err, token) => {
        if (err) throw err; // If there's an error during signing, throw it
        res.json({ token }); // Send the generated token back to the client
      }
    );

  } catch (err) {
    // Catch any server-side errors
    console.error(err.message);
    res.status(500).send('Server Error'); // Send a generic server error response
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token (Login)
// @access  Public (anyone can access this route)
router.post('/login', async (req, res) => {
  const { username, password } = req.body; // Extract username and password from request body

  try {
    // 1. Check if a user with the given username exists
    let user = await User.findOne({ username });
    if (!user) {
      // If user does not exist, return an "Invalid Credentials" error
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 2. Compare the provided password with the stored hashed password
    // bcrypt.compare returns true if the plain-text password matches the hashed password, false otherwise.
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // If passwords do not match, return an "Invalid Credentials" error
      return res.status(400).json({ msg: 'Invalid Credentials' });
    }

    // 3. Create and return a JSON Web Token (JWT) for the logged-in user
    // The payload contains the user's ID.
    const payload = {
      user: {
        id: user.id
      }
    };

    // Sign the token, similar to the registration process
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token }); // Send the generated token back to the client
      }
    );

  } catch (err) {
    // Catch any server-side errors
    console.error(err.message);
    res.status(500).send('Server Error'); // Send a generic server error response
  }
});

// Export the router and the verifyToken middleware
// The verifyToken middleware will be imported and used in server.js to protect routes.
module.exports = { router, verifyToken };
