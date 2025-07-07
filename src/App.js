
import React, { useState, useEffect } from 'react';

// Main App component
export default function App() {
  // State to hold all posts. Initialized with some mock data.
  const [posts, setPosts] = useState(() => {
    // Load posts from localStorage if available, otherwise use initial mock data
    const savedPosts = localStorage.getItem('foodSocialPosts');
    return savedPosts ? JSON.parse(savedPosts) : [
      {
        id: '1',
        user: { name: 'Chef_Anna', avatar: 'https://placehold.co/100x100/FFD700/000000?text=CA' },
        imageUrl: 'https://placehold.co/600x400/FF6347/FFFFFF?text=Delicious+Pasta',
        caption: 'My homemade creamy tomato pasta! So comforting on a rainy day. #pasta #comfortfood #homecooking',
        likes: 125,
        comments: [
          { user: 'FoodieFan', text: 'Looks amazing! Can I get the recipe?' },
          { user: 'BakeMaster', text: 'Yum! Perfect al dente.' },
        ],
        isLiked: false,
      },
      {
        id: '2',
        user: { name: 'GreenEats', avatar: 'https://placehold.co/100x100/98FB98/000000?text=GE' },
        imageUrl: 'https://placehold.co/600x400/6A5ACD/FFFFFF?text=Fresh+Salad',
        caption: 'Fresh and vibrant summer salad with grilled halloumi. Healthy and delicious! #salad #healthyfood #vegetarian',
        likes: 88,
        comments: [
          { user: 'VeggieLover', text: 'Love this combo!' },
        ],
        isLiked: false,
      },
      {
        id: '3',
        user: { name: 'DessertDreamer', avatar: 'https://placehold.co/100x100/ADD8E6/000000?text=DD' },
        imageUrl: 'https://placehold.co/600x400/FFC0CB/000000?text=Chocolate+Cake',
        caption: 'Decadent chocolate lava cake with a scoop of vanilla ice cream. Pure bliss! #chocolate #dessert #lavacake',
        likes: 210,
        comments: [
          { user: 'SweetTooth', text: 'My absolute favorite!' },
          { user: 'BakeMaster', text: 'Recipe please! 😍' },
        ],
        isLiked: false,
      },
    ];
  });

  // Effect to save posts to localStorage whenever the posts state changes
  useEffect(() => {
    localStorage.setItem('foodSocialPosts', JSON.stringify(posts));
  }, [posts]);

  // Function to handle liking/unliking a post
  const handleLike = (postId) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      )
    );
  };

  // Function to handle adding a comment to a post
  const handleAddComment = (postId, commentText) => {
    if (!commentText.trim()) return; // Prevent empty comments
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, { user: 'You', text: commentText }] }
          : post
      )
    );
  };

  // Function to handle adding a new post
  const handleCreatePost = (newPost) => {
    const newId = String(posts.length + 1); // Simple ID generation
    setPosts(prevPosts => [
      {
        id: newId,
        user: { name: 'You', avatar: 'https://placehold.co/100x100/87CEEB/000000?text=YOU' }, // Default avatar for new posts
        likes: 0,
        comments: [],
        isLiked: false,
        ...newPost, // Spread new post data (imageUrl, caption)
      },
      ...prevPosts, // Add new post to the beginning of the feed
    ]);
  };

  return (
    <div className="min-h-screen bg-gray-100 font-inter">
      {/* Header Component */}
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Create Post Component */}
        <CreatePost onCreatePost={handleCreatePost} />

        {/* Feed Component */}
        <Feed posts={posts} onLike={handleLike} onAddComment={handleAddComment} />
      </main>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="bg-white shadow-md py-4 px-6 sticky top-0 z-10 rounded-b-lg">
      <div className="container mx-auto flex justify-between items-center max-w-2xl">
        <h1 className="text-2xl font-bold text-orange-600">FoodieGram</h1>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <button href="#" className="text-gray-700 hover:text-orange-500 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            </li>
            <li>
              <button href="#" className="text-gray-700 hover:text-orange-500 transition duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.341-.341m6.59-4.659A2 2 0 0012 14h4a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 01-.341.341m0 0L9 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 01-.341.341" />
                </svg>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

// Create Post Component
function CreatePost({ onCreatePost }) {
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [showModal, setShowModal] = useState(false); // State for modal visibility

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageUrl.trim() || !caption.trim()) {
      // Simple validation for now
      alert('Please provide both image URL and caption.');
      return;
    }
    onCreatePost({ imageUrl, caption });
    setImageUrl('');
    setCaption('');
    setShowModal(false); // Close modal after submission
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Share Your Culinary Creation!</h2>
      <button
        onClick={() => setShowModal(true)}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
      >
        Create New Post
      </button>

      {/* Modal for Create Post Form */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">New Foodie Post</h3>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="imageUrl" className="block text-gray-700 text-sm font-bold mb-2">
                  Image URL:
                </label>
                <input
                  type="text"
                  id="imageUrl"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g., https://example.com/your-dish.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="caption" className="block text-gray-700 text-sm font-bold mb-2">
                  Caption:
                </label>
                <textarea
                  id="caption"
                  rows="3"
                  className="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="What's cooking? Describe your delicious creation!"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg"
                >
                  Post It!
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Feed Component
function Feed({ posts, onLike, onAddComment }) {
  return (
    <div className="space-y-8">
      {posts.map(post => (
        <PostCard
          key={post.id}
          post={post}
          onLike={onLike}
          onAddComment={onAddComment}
        />
      ))}
    </div>
  );
}

// Post Card Component
function PostCard({ post, onLike, onAddComment }) {
  const [commentText, setCommentText] = useState('');

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    onAddComment(post.id, commentText);
    setCommentText(''); // Clear comment input after submission
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Post Header (User Info) */}
      <div className="flex items-center p-4 border-b border-gray-200">
        <img
          src={post.user.avatar}
          alt={`${post.user.name}'s avatar`}
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <span className="font-semibold text-gray-800">{post.user.name}</span>
      </div>

      {/* Post Image */}
      <img
        src={post.imageUrl}
        alt={post.caption}
        className="w-full h-auto object-cover"
        onError={(e) => {
          e.target.onerror = null; // Prevents infinite loop if placeholder also fails
          e.target.src = `https://placehold.co/600x400/CCCCCC/000000?text=Image+Not+Found`; // Fallback image
        }}
      />

      {/* Post Actions (Like, Comment Icons) */}
      <div className="p-4 flex items-center space-x-4">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center text-gray-600 hover:text-red-500 transition duration-200 ${post.isLiked ? 'text-red-500' : ''}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-7 w-7 ${post.isLiked ? 'fill-current' : 'stroke-current'}`}
            viewBox="0 0 24 24"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
          <span className="ml-1 text-lg font-medium">{post.likes}</span>
        </button>
        <button className="flex items-center text-gray-600 hover:text-blue-500 transition duration-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8.5 8.5z"></path>
          </svg>
          <span className="ml-1 text-lg font-medium">{post.comments.length}</span>
        </button>
      </div>

      {/* Post Caption */}
      <div className="px-4 pb-2">
        <p className="text-gray-800 text-base">
          <span className="font-semibold">{post.user.name}</span> {post.caption}
        </p>
      </div>

      {/* Comments Section */}
      <div className="px-4 pb-4">
        {post.comments.map((comment, index) => (
          <p key={index} className="text-sm text-gray-700 mb-1">
            <span className="font-semibold">{comment.user}:</span> {comment.text}
          </p>
        ))}
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleCommentSubmit} className="p-4 border-t border-gray-200 flex">
        <input
          type="text"
          placeholder="Add a comment..."
          className="flex-grow border border-gray-300 rounded-full py-2 px-4 mr-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-full transition duration-300"
        >
          Post
        </button>
      </form>
    </div>
  );
}

// Add Tailwind CSS script for styling
// IMPORTANT: This script should ideally be in the HTML <head> for a real project,
// but for a single React immersive, it's included here for completeness.
// Also, add the Inter font from Google Fonts.
const tailwindScript = document.createElement('script');
tailwindScript.src = 'https://cdn.tailwindcss.com';
document.head.appendChild(tailwindScript);

const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

const styleTag = document.createElement('style');
styleTag.innerHTML = `
  body {
    font-family: 'Inter', sans-serif;
  }
`;
document.head.appendChild(styleTag);

