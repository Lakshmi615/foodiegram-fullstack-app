// --- server.js ---
// This is the main entry point for your Express.js backend application.

// Import necessary modules
const express = require('express'); // Express.js framework
const mongoose = require('mongoose'); // Mongoose for MongoDB object modeling
const dotenv = require('dotenv'); // For loading environment variables from .env file
const cors = require('cors'); // For enabling Cross-Origin Resource Sharing
const postRoutes = require('./routes/posts'); // Import post routes

// Load environment variables from .env file
// This allows you to keep sensitive information (like database URIs) out of your code
// In a real deployment, these would be configured in your hosting environment.
dotenv.config();

// Initialize the Express application
const app = express();

// --- Middleware ---
// Middleware functions are executed in sequence for every incoming request.

// Enable CORS for all origins.
// In a production environment, you would restrict this to your frontend's domain.
app.use(cors());

// Parse JSON request bodies. This is essential for handling data sent from the frontend.
app.use(express.json());

// --- Database Connection ---
const MONGODB_URI = process.env.MONGODB_URI; // Get MongoDB URI from environment variables

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI is not defined in environment variables.');
  console.error('Please create a .env file with MONGODB_URI=your_mongodb_connection_string');
  // Exit the process if the URI is missing, as the app cannot function without it.
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas!');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    // Exit if database connection fails
    process.exit(1);
  });

// --- Routes ---
// Mount the post routes under the '/api/posts' path.
// All requests to /api/posts will be handled by the postRoutes.
app.use('/api/posts', postRoutes);

// Basic route for the root URL
app.get('/', (req, res) => {
  res.send('FoodieGram Backend API is running!');
});

// --- Error Handling Middleware (Optional but Recommended) ---
// This middleware catches any errors that occur during request processing.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error stack for debugging
  res.status(500).send('Something broke!'); // Send a generic error response
});

// --- Start the Server ---
const PORT = process.env.PORT || 5000; // Use port from environment variable or default to 5000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
