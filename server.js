require('dotenv').config();
const express = require('express');
const cors = require('cors');
const redditAPI = require('./redditAPI'); 
const { initializeWebSocketServer } = require('./webSocket'); // Import WebSocket logic

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(cors({ origin: 'http://localhost:3000', methods: 'GET' }));
app.use(redditAPI); // Reddit API routes

// Start Express Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize WebSocket Server
initializeWebSocketServer(); 
